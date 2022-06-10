import React from 'react';
import type implementations from './implementations';
import type tests from './tests';

export type BenchResultsType = {
  startTime: number;
  endTime: number;
  runTime: number;
  sampleCount: number;
  samples: Array<FullSampleTimingType>;
  max: number;
  min: number;
  median: number;
  mean: number;
  meanLayout: number;
  meanScripting: number;
  stdDev: number;
};

export type BenchmarkName = keyof typeof tests;
export type LibraryName = keyof typeof implementations;

export interface BenchDisplayResults {
  version?: string;
  benchmark: BenchmarkName;
  library: LibraryName;
  analysis?: BenchResultsType;
}

export type SampleTimingType = {
  scriptingStart: number;
  scriptingEnd?: number;
  layoutStart?: number;
  layoutEnd?: number;
};

export type FullSampleTimingType = {
  start: number;
  end: number;
  scriptingStart: number;
  scriptingEnd: number;
  layoutStart?: number;
  layoutEnd?: number;
};

export interface ComponentsType {
  Box: React.ElementType;
  Dot: React.ElementType;
  Provider: React.ElementType;
  View: React.ElementType;
}

export type BenchmarkType = 'mount' | 'update' | 'unmount';

export interface BenchmarkParameters {
  Component: React.ElementType;
  // eslint-disable-next-line @typescript-eslint/ban-types
  getComponentProps: Function;
  sampleCount: number;
  type: BenchmarkType;
}
