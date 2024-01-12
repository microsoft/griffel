export function logError(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined') {
    console.error(...args);
  }
}
