import type { TransformPerfIssue } from '@griffel/transform';

export type StatsCollectorOptions = {
  collectStats: boolean;
  collectPerfIssues: boolean;

  /** A label of the step that transforms modules, "Loader" in Webpack & "Transform" in Vite. */
  transformLabel: string;
  /** A label of the step that extracts CSS from assets, "Plugin" in Webpack & "Extraction" in Vite. */
  extractionLabel: string;
};

export type TransformStats = {
  evaluationMode: 'ast' | 'vm';
  perfIssues?: TransformPerfIssue[];
};

type FileStats = {
  time: bigint;
  evaluationMode: 'ast' | 'vm';
};

type PerfIssue = {
  type: TransformPerfIssue['type'];
  dependencyFilename: string;
  sourceFilenames: Set<string>;
};

function formatTime(time: bigint): string {
  if (time > 1_000_000n) {
    return (time / 1_000_000n).toString() + 'ms';
  }

  if (time > 1_000n) {
    return (time / 1_000n).toString() + 'μs';
  }

  return time.toString() + 'ns';
}

/**
 * Collects & prints timings of transforms and dependencies that are known to slow down evaluation. Shared by bundler
 * integrations to keep the reported output identical.
 */
export function createStatsCollector(options: StatsCollectorOptions) {
  const { collectStats, collectPerfIssues, transformLabel, extractionLabel } = options;
  const isEnabled = collectStats || collectPerfIssues;

  const statsByFile = new Map<string, FileStats>();
  const perfIssues = new Map<string, PerfIssue>();

  let extractionTime = 0n;

  return {
    /** Returns a timestamp to be passed to `register()` & `registerExtraction()`, zero if stats are disabled. */
    now(): bigint {
      return collectStats ? process.hrtime.bigint() : 0n;
    },

    clear(): void {
      statsByFile.clear();
      perfIssues.clear();

      extractionTime = 0n;
    },

    register(filename: string, startTime: bigint, stats: TransformStats): void {
      if (!isEnabled) {
        return;
      }

      if (collectStats) {
        statsByFile.set(filename, {
          time: process.hrtime.bigint() - startTime,
          evaluationMode: stats.evaluationMode,
        });
      }

      if (collectPerfIssues && stats.perfIssues) {
        for (const issue of stats.perfIssues) {
          const key = `${issue.type}:${issue.dependencyFilename}`;
          const existingIssue = perfIssues.get(key);

          if (existingIssue) {
            existingIssue.sourceFilenames.add(filename);
          } else {
            perfIssues.set(key, {
              type: issue.type,
              dependencyFilename: issue.dependencyFilename,
              sourceFilenames: new Set([filename]),
            });
          }
        }
      }
    },

    registerExtraction(startTime: bigint): void {
      if (!collectStats) {
        return;
      }

      extractionTime = process.hrtime.bigint() - startTime;
    },

    print(): void {
      /* eslint-disable no-console */
      if (collectStats) {
        const entries = Array.from(statsByFile.entries()).sort(([, a], [, b]) => Number(b.time - a.time));
        const totalTime = entries.reduce((acc, entry) => acc + entry[1].time, 0n);
        const fileCount = entries.length;
        const averageTime = fileCount > 0 ? totalTime / BigInt(fileCount) : 0n;

        const astEntries = entries.filter(entry => entry[1].evaluationMode === 'ast');
        const vmEntries = entries.filter(entry => entry[1].evaluationMode === 'vm');
        const astTime = astEntries.reduce((acc, entry) => acc + entry[1].time, 0n);
        const vmTime = vmEntries.reduce((acc, entry) => acc + entry[1].time, 0n);
        const astHitPercentage = fileCount > 0 ? ((astEntries.length / fileCount) * 100).toFixed(1) + '%' : '0.0%';

        console.log(`\n[Griffel] ${fileCount} files processed`);
        console.log(
          `[Griffel] ${transformLabel}: ${formatTime(totalTime)} ` +
            `(AST ${formatTime(astTime)} | VM ${formatTime(vmTime)}), ` +
            `avg ${formatTime(averageTime)}/file, AST eval hit ${astHitPercentage}`,
        );
        console.log(`[Griffel] ${extractionLabel}: ${formatTime(extractionTime)}`);
        console.log('');

        for (const [filename, fileStats] of entries) {
          const time = formatTime(fileStats.time).padStart(6);
          const evaluationMode = fileStats.evaluationMode === 'vm' ? 'vm ' : 'ast';

          console.log(`  ${time} ${evaluationMode} ${filename}`);
        }

        console.log();
      }

      if (collectPerfIssues && perfIssues.size > 0) {
        const issues = Array.from(perfIssues.values());
        const cjsCount = issues.filter(issue => issue.type === 'cjs-module').length;
        const barrelCount = issues.filter(issue => issue.type === 'barrel-export-star').length;

        console.log(`\n[Griffel] Perf issues: ${cjsCount} CJS (no tree-shaking), ${barrelCount} barrel (export *)`);
        console.log('');

        for (const issue of issues) {
          const tag = issue.type === 'cjs-module' ? ' cjs' : 'barrel';
          const sourceFilenames = Array.from(issue.sourceFilenames).join(', ');

          console.log(`  ${tag} ${issue.dependencyFilename} (from: ${sourceFilenames})`);
        }

        console.log();
      }
      /* eslint-enable no-console */
    },
  };
}
