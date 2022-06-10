import React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import implementations from './implementations';
import { ReportCard, Select } from './components';
import tests from './tests';
import { Benchmark } from './Benchmark';
import type { BenchDisplayResults, BenchmarkName, BenchResultsType, LibraryName } from './types';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100%',
  },
  button: {
    minHeight: '40px',
    fontSize: ' 20px',
    cursor: 'pointer',
  },
  results: {
    marginTop: '10px',
    ...shorthands.borderTop('1px', 'solid', 'black'),
    ...shorthands.padding('10px', '0'),
  },
  runContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },
  runActions: {
    display: 'flex',
    '& button': {
      flexGrow: 1,
    },
  },
  benchmarkContainer: {
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },
});

type AppAction =
  | { type: 'SELECT_BENCHMARK'; payload: BenchmarkName }
  | { type: 'SELECT_LIBRARY'; payload: { library: LibraryName; version?: string } }
  | { type: 'BENCHMARK_COMPLETED'; payload: BenchResultsType }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'START_BENCHMARK' };

interface AppState {
  benchmark: BenchmarkName;
  library: LibraryName;
  version?: string;
  results: BenchDisplayResults[];
  inProgress: boolean;
}

const appInitialState: AppState = {
  benchmark: 'Mount deep tree',
  library: Object.keys(implementations)[0],
  results: [],
  inProgress: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_LIBRARY':
      return {
        ...state,
        library: action.payload.library,
        version: action.payload.version,
      };
    case 'SELECT_BENCHMARK':
      return {
        ...state,
        benchmark: action.payload,
      };
    case 'CLEAR_RESULTS':
      return {
        ...state,
        results: [],
      };
    case 'BENCHMARK_COMPLETED':
      const resultsWithCompletedBenchmark = [...state.results].slice(0, -1);
      resultsWithCompletedBenchmark.push({
        analysis: { ...action.payload },
        library: state.library,
        benchmark: state.benchmark,
      });
      return {
        ...state,
        inProgress: false,
        results: resultsWithCompletedBenchmark,
      };

    case 'START_BENCHMARK':
      const resultsWithNewBenchmark = [...state.results];
      resultsWithNewBenchmark.push({
        version: state.version,
        library: state.library,
        benchmark: state.benchmark,
      });
      return { ...state, inProgress: true, results: resultsWithNewBenchmark };
  }
}

export const App: React.FC = () => {
  const styles = useStyles();
  const [state, dispatch] = React.useReducer(appReducer, appInitialState);
  const { library, benchmark, results, inProgress } = state;
  const imperativeRef = React.useRef({ start: () => null });
  React.useEffect(() => {
    if (inProgress) {
      imperativeRef.current.start();
    }
  }, [inProgress]);

  const benchmarkToRun = tests[benchmark][library];
  const {
    components: { Provider },
  } = implementations[library];

  return (
    <div className={styles.root}>
      <div className={styles.runContainer}>
        <div className={styles.runActions}>
          <button
            className={styles.button}
            disabled={inProgress}
            onClick={() => {
              dispatch({ type: 'START_BENCHMARK' });
            }}
          >
            {inProgress ? 'Running...' : 'Run'}
          </button>
          <button className={styles.button} onClick={() => dispatch({ type: 'CLEAR_RESULTS' })}>
            Clear results
          </button>
        </div>
        <Select
          label="Library"
          value={library}
          onChange={e =>
            dispatch({
              type: 'SELECT_LIBRARY',
              payload: { library: e.target.value, version: implementations[e.target.value].version },
            })
          }
        >
          {Object.keys(implementations).map(implementation => (
            <option value={implementation} key={implementation}>
              {implementation}
            </option>
          ))}
        </Select>
        <Select
          label="Benchmark"
          value={benchmark}
          onChange={e => dispatch({ type: 'SELECT_BENCHMARK', payload: e.target.value as BenchmarkName })}
        >
          {Object.keys(tests).map(test => (
            <option value={test} key={test}>
              {test}
            </option>
          ))}
        </Select>
        <div className={styles.results}>
          {results.map(result => (
            <ReportCard {...result} version={result.version} />
          ))}
        </div>
      </div>
      <div className={styles.benchmarkContainer}>
        <Provider>
          {inProgress ? (
            <Benchmark
              forceLayout
              // TODO benchmark code uses legacy refs that can't be typed - refactor it to be functional
              // @ts-expect-error
              ref={imperativeRef}
              {...benchmarkToRun}
              onComplete={res => dispatch({ type: 'BENCHMARK_COMPLETED', payload: res })}
            />
          ) : (
            <benchmarkToRun.Component {...benchmarkToRun.getComponentProps({ cycle: 10 })} />
          )}
        </Provider>
      </div>
    </div>
  );
};
