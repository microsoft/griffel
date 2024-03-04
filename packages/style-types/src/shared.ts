export type GriffelStylesCSSValue = string | 0;

export type ValueOrArray<T> = T | Array<T>;
export type Fallback<T> = { [P in keyof T]: T[P] | NonNullable<T[P]>[] };
