/**
 * Mocked `process` variable for the VM sandbox used in module evaluation.
 * Copied from @linaria/babel-preset v3.0.0-beta.19.
 */

export const nextTick = (fn: (...args: unknown[]) => void): ReturnType<typeof setTimeout> => setTimeout(fn, 0);

export const platform = 'browser';
export const arch = 'browser';
export const execPath = 'browser';
export const title = 'browser';
export const pid = 1;
export const browser = true;
export const argv: string[] = [];

export const binding = function binding(): never {
  throw new Error('No such module. (Possibly not yet loaded)');
};

export const cwd = (): string => '/';

const noop = (): void => {};

export const exit = noop;
export const kill = noop;
export const chdir = noop;
export const umask = noop;
export const dlopen = noop;
export const uptime = noop;
export const memoryUsage = noop;
export const uvCounters = noop;
export const features = {};
export const env = process.env;
