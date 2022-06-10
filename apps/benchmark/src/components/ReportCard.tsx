import React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { BenchDisplayResults } from '../types';

interface ReportCardProps extends Partial<BenchDisplayResults> {
  version?: string;
}

const useStyles = makeStyles({
  root: {
    ...shorthands.margin('10px', '0px'),
    ...shorthands.padding('4px', '10px'),
    ...shorthands.borderBottom('1px', 'solid', 'gray'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  strong: {
    fontSize: '20px',
    fontWeight: 700,
  },
});

const fmt = (time: number) => {
  console.log(time);
  const milliSecs = Number(Math.round(time * 100) / 100);
  const str = milliSecs.toFixed(2);
  return 10 / milliSecs > 1 ? `0${str}` : str;
};

const ReportCard: React.FC<ReportCardProps> = ({ library, version, benchmark, analysis }) => {
  const styles = useStyles();
  const sampleCountText = analysis ? `(${analysis.sampleCount})` : '';
  const versionText = version ? `@${version}` : '';

  return (
    <div className={styles.root}>
      <div className={styles.column}>
        <div className={styles.strong}>{`${library}${versionText}`}</div>
        <div>
          {benchmark} {sampleCountText}
        </div>
      </div>
      <div className={styles.column}>
        {analysis ? (
          <>
            <div className={styles.strong}>
              {fmt(analysis.mean)} ±{fmt(analysis.stdDev)} ms
            </div>
            <div>
              (S/L) {fmt(analysis.meanScripting)}/{fmt(analysis.meanLayout)} ms
            </div>
          </>
        ) : (
          <div className={styles.strong}>In progress...</div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
