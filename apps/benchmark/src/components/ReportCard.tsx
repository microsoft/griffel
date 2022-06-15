import React from 'react';
import { BenchDisplayResults } from '../types';

interface ReportCardProps extends Partial<BenchDisplayResults> {
  version?: string;
}

const fmt = (time: number) => {
  console.log(time);
  const milliSecs = Number(Math.round(time * 100) / 100);
  const str = milliSecs.toFixed(2);
  return 10 / milliSecs > 1 ? `0${str}` : str;
};

const ReportCard: React.FC<ReportCardProps> = ({ library, version, benchmark, analysis }) => {
  const sampleCountText = analysis ? `(${analysis.sampleCount})` : '';
  const versionText = version ? `@${version}` : '';

  return (
    <div className="report-card">
      <div className="column">
        <div className="main">{`${library}${versionText}`}</div>
        <div>
          {benchmark} {sampleCountText}
        </div>
      </div>
      <div className="column">
        {analysis ? (
          <>
            <div className="main">
              {fmt(analysis.mean)} ±{fmt(analysis.stdDev)} ms
            </div>
            <div>
              (S/L) {fmt(analysis.meanScripting)}/{fmt(analysis.meanLayout)} ms
            </div>
          </>
        ) : (
          <div className="main">In progress...</div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
