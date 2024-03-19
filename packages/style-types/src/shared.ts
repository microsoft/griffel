export type GriffelStylesCSSValue = string | 0;

/**
 * instead of using `CSS.PropertiesFallback` from csstype that remaps properties to `readonly` union we need to use our cutom Fallback mapped type in order to avoid type issues
 * @see https://github.com/frenic/csstype/blob/master/src/typescript.ts#L73
 */
export type Fallback<T> = { [P in keyof T]: T[P] | NonNullable<T[P]>[] };

export type ValueOrArray<T> = T | Array<T>;
