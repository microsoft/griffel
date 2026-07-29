/**
 * Formats a duration the way the step log wants to read: exact while a step is still cheap, coarse
 * once it is the kind of number worth looking at.
 */
function formatDuration(ms: number): string {
  return ms < 1_000 ? `${ms}ms` : `${(ms / 1_000).toFixed(1)}s`;
}

/**
 * Reports a completed step of a scenario's setup, with how long it took.
 *
 * Setting these suites up is almost entirely waiting — packing tarballs, resolving and downloading
 * a dependency tree, linking it — and how that time is distributed is the first thing worth knowing
 * when one of them is slow enough to hit a timeout. The durations live here rather than at each
 * call site so every step reports them the same way and none of them can quietly stop.
 */
export function logStep(message: string, startedAt: number): void {
  console.log('✅', message, `(${formatDuration(Date.now() - startedAt)})`);
}

/**
 * Runs a step and reports it once it settles.
 *
 * The message may be built from the step's own result, so a step can name what it produced.
 */
export async function step<T>(message: string | ((result: T) => string), work: () => T | Promise<T>): Promise<T> {
  const startedAt = Date.now();
  const result = await work();

  logStep(typeof message === 'function' ? message(result) : message, startedAt);

  return result;
}
