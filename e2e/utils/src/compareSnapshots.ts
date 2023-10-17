import * as fs from 'fs';
import * as prettier from 'prettier';
import * as snapshotDiff from 'snapshot-diff';

type CompareSnapshotsOptions = {
  type: 'css';
  snapshotFile: string;
  resultFile: string;
};

function formatCSS(css: string): string {
  return prettier.format(css, { parser: 'css' }).trim();
}

export async function compareSnapshots(options: CompareSnapshotsOptions): Promise<void> {
  const { snapshotFile, resultFile } = options;

  const resultContent = formatCSS(await fs.promises.readFile(resultFile, 'utf8'));
  const snapshotContent = formatCSS(await fs.promises.readFile(snapshotFile, 'utf8'));

  const diff = snapshotDiff(snapshotContent, resultContent, {
    colors: true,
    aAnnotation: snapshotFile,
    bAnnotation: resultFile,
  });

  if (diff.includes('Compared values have no visual difference.')) {
    return;
  }

  console.log(diff);
  throw new Error('CSS output does not match existing snapshot');
}
