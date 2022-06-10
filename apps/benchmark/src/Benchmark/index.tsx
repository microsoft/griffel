/**
 * Core benchmarking code is not original and
 * taken from https://github.com/necolas/react-native-web/tree/master/packages/benchmarks
 */

import React, { Component } from 'react';
import { getMean, getMedian, getStdDev } from './utils/math';
import * as Timing from './utils/timing';

import type {
  BenchResultsType,
  FullSampleTimingType,
  SampleTimingType,
  BenchmarkType,
  BenchmarkParameters,
} from '../types';

export const BenchmarkTypes = {
  MOUNT: 'mount',
  UPDATE: 'update',
  UNMOUNT: 'unmount',
} as const;

const shouldRender = (cycle: number, type: BenchmarkType): boolean => {
  switch (type) {
    // Render every odd iteration (first, third, etc)
    // Mounts and unmounts the component
    case BenchmarkTypes.MOUNT:
    case BenchmarkTypes.UNMOUNT:
      return !((cycle + 1) % 2);
    // Render every iteration (updates previously rendered module)
    case BenchmarkTypes.UPDATE:
      return true;
    default:
      return false;
  }
};

const shouldRecord = (cycle: number, type: BenchmarkType): boolean => {
  switch (type) {
    // Record every odd iteration (when mounted: first, third, etc)
    case BenchmarkTypes.MOUNT:
      return !((cycle + 1) % 2);
    // Record every iteration
    case BenchmarkTypes.UPDATE:
      return true;
    // Record every even iteration (when unmounted)
    case BenchmarkTypes.UNMOUNT:
      return !(cycle % 2);
    default:
      return false;
  }
};

const isDone = (cycle: number, sampleCount: number, type: BenchmarkType): boolean => {
  switch (type) {
    case BenchmarkTypes.MOUNT:
      return cycle >= sampleCount * 2 - 1;
    case BenchmarkTypes.UPDATE:
      return cycle >= sampleCount - 1;
    case BenchmarkTypes.UNMOUNT:
      return cycle >= sampleCount * 2;
    default:
      return true;
  }
};

const sortNumbers = (a: number, b: number): number => a - b;

interface BenchmarkProps extends BenchmarkParameters {
  forceLayout?: boolean;
  timeout: number;
  onComplete: (x: BenchResultsType) => void;
}

type BenchmarkState = {
  componentProps: object;
  cycle: number;
  running: boolean;
};

/**
 * Benchmark
 * TODO: documentation
 */
export class Benchmark extends Component<BenchmarkProps, BenchmarkState> {
  _raf?: number;
  _startTime: number;
  _samples: Array<SampleTimingType>;

  static displayName = 'Benchmark';

  static defaultProps: {
    sampleCount: number;
    timeout: number;
    type: BenchmarkProps['type'];
  } = {
    sampleCount: 50,
    timeout: 10000, // 10 seconds
    type: BenchmarkTypes.MOUNT,
  };

  constructor(props: BenchmarkProps, context?: object) {
    super(props, context);
    const cycle = 0;
    const componentProps = props.getComponentProps({ cycle });
    this.state = {
      componentProps,
      cycle,
      running: false,
    };
    this._startTime = 0;
    this._samples = [];
  }

  override componentWillReceiveProps(nextProps: BenchmarkProps) {
    if (nextProps) {
      this.setState(state => ({ componentProps: nextProps.getComponentProps(state.cycle) }));
    }
  }

  override componentWillUpdate(nextProps: BenchmarkProps, nextState: BenchmarkState) {
    if (nextState.running && !this.state.running) {
      this._startTime = Timing.now();
    }
  }

  override componentDidUpdate() {
    const { forceLayout, sampleCount, timeout, type } = this.props;
    const { cycle, running } = this.state;

    if (running && shouldRecord(cycle, type)) {
      this._samples[cycle].scriptingEnd = Timing.now();

      // force style recalc that would otherwise happen before the next frame
      if (forceLayout) {
        this._samples[cycle].layoutStart = Timing.now();
        if (document.body) {
          document.body.offsetWidth;
        }
        this._samples[cycle].layoutEnd = Timing.now();
      }
    }

    if (running) {
      const now = Timing.now();
      if (!isDone(cycle, sampleCount, type) && now - this._startTime < timeout) {
        this._handleCycleComplete();
      } else {
        this._handleComplete(now);
      }
    }
  }

  override componentWillUnmount() {
    if (this._raf) {
      window.cancelAnimationFrame(this._raf);
    }
  }

  override render() {
    const { Component, type } = this.props;
    const { componentProps, cycle, running } = this.state;
    if (running && shouldRecord(cycle, type)) {
      this._samples[cycle] = { scriptingStart: Timing.now() };
    }

    return running && shouldRender(cycle, type) ? <Component {...componentProps} /> : null;
  }

  start() {
    this._samples = [];
    this.setState(() => ({ running: true, cycle: 0 }));
  }

  _handleCycleComplete() {
    const { getComponentProps, type } = this.props;
    const { cycle } = this.state;

    let componentProps: Record<string, string | number>;
    if (getComponentProps) {
      // Calculate the component props outside of the time recording (render)
      // so that it doesn't skew results
      componentProps = getComponentProps({ cycle });
      // make sure props always change for update tests
      if (type === BenchmarkTypes.UPDATE) {
        componentProps['data-test'] = cycle;
      }
    }

    this._raf = window.requestAnimationFrame(() => {
      this.setState((state: BenchmarkState) => ({
        cycle: state.cycle + 1,
        componentProps,
      }));
    });
  }

  getSamples(): FullSampleTimingType[] {
    return this._samples.reduce(
      (
        memo: FullSampleTimingType[],
        { scriptingStart, scriptingEnd, layoutStart, layoutEnd }: SampleTimingType,
      ): FullSampleTimingType[] => {
        memo.push({
          start: scriptingStart,
          end: layoutEnd || scriptingEnd || 0,
          scriptingStart,
          scriptingEnd: scriptingEnd || 0,
          layoutStart,
          layoutEnd,
        });
        return memo;
      },
      [],
    );
  }

  _handleComplete(endTime: number) {
    const { onComplete } = this.props;
    const samples = this.getSamples();

    this.setState(() => ({ running: false, cycle: 0 }));

    const runTime = endTime - this._startTime;
    const sortedElapsedTimes = samples.map(({ start, end }) => end - start).sort(sortNumbers);
    const sortedScriptingElapsedTimes = samples
      .map(({ scriptingStart, scriptingEnd }) => scriptingEnd - scriptingStart)
      .sort(sortNumbers);
    const sortedLayoutElapsedTimes = samples
      .map(({ layoutStart, layoutEnd }) => (layoutEnd || 0) - (layoutStart || 0))
      .sort(sortNumbers);

    onComplete({
      startTime: this._startTime,
      endTime,
      runTime,
      sampleCount: samples.length,
      samples: samples,
      max: sortedElapsedTimes[sortedElapsedTimes.length - 1],
      min: sortedElapsedTimes[0],
      median: getMedian(sortedElapsedTimes),
      mean: getMean(sortedElapsedTimes),
      stdDev: getStdDev(sortedElapsedTimes),
      meanLayout: getMean(sortedLayoutElapsedTimes),
      meanScripting: getMean(sortedScriptingElapsedTimes),
    });
  }
}
