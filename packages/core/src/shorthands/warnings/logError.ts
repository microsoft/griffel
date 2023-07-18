export function logError(...args: any[]): void {
  if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined') {
    console.error(...args);
  }
}
