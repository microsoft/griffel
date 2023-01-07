import { resolveResetStyleRules } from '@griffel/core';
import type { CSSRulesByBucket, GriffelResetStyle } from '@griffel/core';
import type { ValueCache } from '@wyw-in-js/processor-utils';

import { createRuleLiteral } from './assets/createRuleLiteral';
import { normalizeStyleRules } from './assets/normalizeStyleRules';
import BaseGriffelProcessor from './BaseGriffelProcessor';
import { FileContext } from './types';

export default class MakeResetStylesProcessor extends BaseGriffelProcessor {
  #ltrClassName: string | null = null;
  #rtlClassName: string | null = null;
  #cssRules: CSSRulesByBucket | string[] | null = null;

  public override build(valueCache: ValueCache) {
    const styles = valueCache.get(this.expressionName) as GriffelResetStyle;

    [this.#ltrClassName, this.#rtlClassName, this.#cssRules] = resolveResetStyleRules(
      // Heads up!
      // Style rules should be normalized *before* they will be resolved to CSS rules to have deterministic
      // results across different build targets.
      normalizeStyleRules(this.path, this.context as FileContext, styles),
    );
  }

  public override doRuntimeReplacement(): void {
    if (!this.#cssRules || !this.#ltrClassName) {
      throw new Error('Styles are not extracted yet. Please call `build` first.');
    }

    const t = this.astService;
    const addAssetImport = (path: string) => t.addDefaultImport(path, 'asset');

    let rulesExpression;

    if (Array.isArray(this.#cssRules)) {
      rulesExpression = t.arrayExpression(
        this.#cssRules.map(rule => {
          return createRuleLiteral(this.path, t, this.context as FileContext, rule, addAssetImport);
        }),
      );
    } else {
      rulesExpression = t.objectExpression(
        Object.entries(this.#cssRules).map(([bucketName, cssRules]) =>
          t.objectProperty(
            t.identifier(bucketName),
            t.arrayExpression(
              cssRules.map(rule => {
                return createRuleLiteral(this.path, t, this.context as FileContext, rule as string, addAssetImport);
              }),
            ),
          ),
        ),
      );
    }

    const stylesImportIdentifier = t.addNamedImport('__resetStyles', this.tagSource.source);
    const stylesCallExpression = t.callExpression(stylesImportIdentifier, [
      t.stringLiteral(this.#ltrClassName),
      this.#rtlClassName ? t.stringLiteral(this.#rtlClassName) : t.nullLiteral(),
      rulesExpression,
    ]);

    this.replacer(stylesCallExpression, true);
  }
}
