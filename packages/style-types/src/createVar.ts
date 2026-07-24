declare const griffelVarBrand: unique symbol;

/**
 * A reference to a unique CSS custom property produced by `createVar()`.
 *
 * Coerces to a CSS custom-property name via `Symbol.toPrimitive`, which lets
 * it be used as an object key (`[v]: 'red'`) and inside template strings
 * (`var(${v})`).
 */
export interface GriffelVar {
  toString(): string;
  [Symbol.toPrimitive](hint: string): string;
  readonly [griffelVarBrand]: true;
}
