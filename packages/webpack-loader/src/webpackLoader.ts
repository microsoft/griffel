import linariaLoader from '@linaria/webpack-loader';

export function shouldTransformSourceCode(source: string | Buffer): boolean {
  const code = Buffer.isBuffer(source) ? source.toString('utf8') : source;

  return new RegExp(`\\b(makeStyles|makeResetStyles)`).test(code);
}

export function webpackLoader(
  this: ThisParameterType<typeof linariaLoader>,
  ...args: Parameters<typeof linariaLoader>
): void {
  // Loaders are cacheable by default, but there are edge cases/bugs when caching does not work until it's specified:
  // https://github.com/webpack/webpack/issues/14946
  this.cacheable();

  // Early return to handle cases when makeStyles() calls are not present, allows to avoid expensive invocation of Babel
  if (!shouldTransformSourceCode(args[0])) {
    this.callback(null, args[0], args[1]);
    return;
  }

  return linariaLoader.apply(this, args);
}
