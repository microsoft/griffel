export function absolutePathToRelative(
  path: typeof import('path'),
  projectRoot: string,
  filename: string,
  assetPath: string,
) {
  const fileDirectory = path.dirname(filename);

  const absoluteAssetPath = path.resolve(projectRoot, assetPath);
  const assetDirectory = path.dirname(absoluteAssetPath);

  if (fileDirectory === assetDirectory) {
    return './' + path.basename(assetPath);
  }

  const relativeAssetPath = path.relative(fileDirectory, absoluteAssetPath);

  // Normalize paths to be POSIX-like as bundlers don't handle Windows paths
  // "path.posix" does not make sense there as there is no "windows-to-posix-path" function
  return relativeAssetPath.split(path.sep).join(path.posix.sep);
}
