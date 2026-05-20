import fs from 'fs';
import prettier from 'prettier';
import snapshotDiff from 'snapshot-diff';

type CompareSnapshotsOptions = {
  type: 'css';
  snapshotFile: string;
  resultFile: string;
  update?: boolean;
  /**
   * Optional post-format transform applied to both the build output and the snapshot before
   * comparison (and to the build output before it's written when `update: true`). Use it to
   * normalize content that's intrinsically non-deterministic across runs (e.g. paths, hashes
   * that depend on absolute build directories). The function should be idempotent.
   */
  normalize?: (css: string) => string;
};

async function formatCSS(css: string): Promise<string> {
  return (await prettier.format(css, { parser: 'css' })).trim();
}

export async function compareSnapshots(options: CompareSnapshotsOptions): Promise<void> {
  const { snapshotFile, resultFile, update, normalize } = options;

  const resultContentRaw = await fs.promises.readFile(resultFile, 'utf8');
  // Remove meta info added by Rspack
  const resultContentCleaned = resultContentRaw.replace(/head{--webpack-rspack-(\d+)-(\w+)-(\d+):&_(\d+);}/, '');
  const formattedResult = await formatCSS(resultContentCleaned);
  const resultContent = normalize ? normalize(formattedResult) : formattedResult;

  if (update) {
    await fs.promises.writeFile(snapshotFile, resultContent + '\n');
    console.log('📝', `Snapshot updated at ${snapshotFile}`);
    return;
  }

  const formattedSnapshot = await formatCSS(await fs.promises.readFile(snapshotFile, 'utf8'));
  const snapshotContent = normalize ? normalize(formattedSnapshot) : formattedSnapshot;

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
