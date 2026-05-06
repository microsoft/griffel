export function logError(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}
