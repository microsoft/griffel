// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isObject(val: any): val is Record<string, unknown> {
  // eslint-disable-next-line eqeqeq
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}
