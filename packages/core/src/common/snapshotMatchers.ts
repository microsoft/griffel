import { expect, chai, Snapshots } from 'vitest';
import * as prettier from 'prettier';

import { DATA_BUCKET_ATTR } from '../constants.js';
import type { resolveStyleRules } from '../runtime/resolveStyleRules.js';
import { normalizeCSSBucketEntry } from '../runtime/utils/normalizeCSSBucketEntry.js';
import type { CSSRulesByBucket, GriffelRenderer } from '../types.js';
import type { resolveResetStyleRules } from '../runtime/resolveResetStyleRules.js';

const { toMatchInlineSnapshot } = Snapshots;

// eslint-disable-next-line eqeqeq
const isObject = (value: unknown) => value != null && !Array.isArray(value) && typeof value === 'object';

type StyleRulesTuple = ReturnType<typeof resolveStyleRules>;
type ResetStyleRulesTuple = ReturnType<typeof resolveResetStyleRules>;

const isRenderer = (value: unknown): value is GriffelRenderer =>
  isObject(value) && isObject((value as GriffelRenderer).stylesheets);
const isStyleRulesTuple = (value: unknown): value is StyleRulesTuple =>
  Array.isArray(value) && value.length === 2 && !Array.isArray(value[0]);

function rendererToCSS(renderer: GriffelRenderer): string {
  const stylesheetKeys = Object.keys(renderer.stylesheets) as (keyof (typeof renderer)['stylesheets'])[];

  const rules = stylesheetKeys.reduce((acc, styleEl) => {
    const stylesheet = renderer.stylesheets[styleEl];

    if (stylesheet) {
      const cssRules = stylesheet.cssRules() ?? ([] as string[]);
      const attributes = Object.entries(stylesheet.elementAttributes).filter(([key]) => key !== DATA_BUCKET_ATTR);

      if (cssRules.length === 0) {
        return acc;
      }

      return [
        ...acc,
        `/** bucket "${styleEl.slice(0, 1)}"${
          attributes.length > 0 ? ' ' + JSON.stringify(Object.fromEntries(attributes)) : ''
        } **/`,
        ...cssRules,
      ];
    }

    return acc;
  }, [] as string[]);

  return rules.join('\n');
}

function styleRulesToCSS(value: StyleRulesTuple): string {
  const cssRulesByBucket = value[1];
  const keys = Object.keys(cssRulesByBucket) as (keyof typeof cssRulesByBucket)[];

  return keys
    .flatMap(styleBucketName => cssRulesByBucket[styleBucketName]!.map(entry => normalizeCSSBucketEntry(entry)[0]))
    .join('\n');
}

function resetStyleRulesToCSS(value: ResetStyleRulesTuple): string {
  const cssRulesByBucket: CSSRulesByBucket = Array.isArray(value[2]) ? { r: value[2] } : value[2];

  return Object.entries(cssRulesByBucket)
    .filter(([, rules]) => rules.length > 0)
    .flatMap(([key, rules]) => [`/** bucket "${key}" */`, (rules as string[]).join('\n')])
    .join('\n');
}

function toRawCSS(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (isRenderer(value)) {
    return rendererToCSS(value);
  }
  if (isStyleRulesTuple(value)) {
    return styleRulesToCSS(value);
  }
  if (Array.isArray(value)) {
    return resetStyleRulesToCSS(value as ResetStyleRulesTuple);
  }
  throw new Error(`toMatchFormattedInlineSnapshot: unsupported value type "${typeof value}"`);
}

expect.extend({
  async toMatchFormattedInlineSnapshot(received: unknown, inlineSnapshot?: string) {
    // Capture the call site synchronously so vitest reports the right location on failure.
    // Must set the flag on this.assertion (the Chai assertion object) because toMatchInlineSnapshot
    // reads the error via chai.util.flag(assertion, 'error') where assertion = this.assertion.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chai.util.flag((this as any).assertion, 'error', new Error());

    const rawCSS = toRawCSS(received);
    const formatted = (await prettier.format(rawCSS, { parser: 'css' })).trim();

    return toMatchInlineSnapshot.call(this, formatted, inlineSnapshot);
  },
});

interface CustomMatchers<R = unknown> {
  toMatchFormattedInlineSnapshot(inlineSnapshot?: string): R;
}

declare module 'vitest' {
  /* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any */
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
  /* eslint-enable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any */
}
