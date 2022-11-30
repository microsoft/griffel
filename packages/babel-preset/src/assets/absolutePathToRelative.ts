export function absolutePathToRelative(
  path: typeof import('path'),
  projectRoot: string,
  filename: string,
  assetPath: string,
) {
  const fileDirectory = path.dirname(filename);
  const absoluteAssetPath = path.resolve(projectRoot, assetPath);

  let relativeAssetPath = path.relative(fileDirectory, absoluteAssetPath);

  if (!relativeAssetPath.startsWith('..' + path.sep)) {
    relativeAssetPath = './' + relativeAssetPath;
  }

  // Normalize paths to be POSIX-like as bundlers don't handle Windows paths
  // "path.posix" does not make sense there as there is no "windows-to-posix-path" function
  return relativeAssetPath.split(path.sep).join(path.posix.sep);
}
