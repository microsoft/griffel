import fs from 'fs';
import prettier from 'prettier';
import snapshotDiff from 'snapshot-diff';

type CompareSnapshotsOptions = {
  type: 'css';
  snapshotFile: string;
  resultFile: string;
  update?: boolean;
};

async function formatCSS(css: string): Promise<string> {
  return (await prettier.format(css, { parser: 'css' })).trim();
}

export async function compareSnapshots(options: CompareSnapshotsOptions): Promise<void> {
  const { snapshotFile, resultFile, update } = options;

  const resultContentRaw = await fs.promises.readFile(resultFile, 'utf8');
  // Remove meta info added by Rspack
  const resultContentCleaned = resultContentRaw.replace(/head{--webpack-rspack-(\d+)-(\w+)-(\d+):&_(\d+);}/, '');
  const resultContent = await formatCSS(resultContentCleaned);

  if (update) {
    await fs.promises.writeFile(snapshotFile, resultContent + '\n');
    console.log('📝', `Snapshot updated at ${snapshotFile}`);
    return;
  }

  const snapshotContent = await formatCSS(await fs.promises.readFile(snapshotFile, 'utf8'));

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
