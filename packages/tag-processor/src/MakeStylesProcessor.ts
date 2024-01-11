import { resolveStyleRulesForSlots } from '@griffel/core';
import type { CSSClassesMapBySlot, CSSRulesByBucket, GriffelStyle } from '@griffel/core';
import type { ValueCache } from '@wyw-in-js/processor-utils';

import { createRuleLiteral } from './assets/createRuleLiteral';
import { normalizeStyleRules } from './assets/normalizeStyleRules';
import BaseGriffelProcessor from './BaseGriffelProcessor';
import type { FileContext } from './types';
import { dedupeCSSRules } from './utils/dedupeCSSRules';

export default class MakeStylesProcessor extends BaseGriffelProcessor {
  #cssClassMap: CSSClassesMapBySlot<string> | undefined;
  #cssRulesByBucket: CSSRulesByBucket | undefined;

  public override build(valueCache: ValueCache) {
    const stylesBySlots = valueCache.get(this.expressionName) as Record<string /* slot */, GriffelStyle>;

    [this.#cssClassMap, this.#cssRulesByBucket] = resolveStyleRulesForSlots(
      // Heads up!
      // Style rules should be normalized *before* they will be resolved to CSS rules to have deterministic
      // results across different build targets.
      normalizeStyleRules(this.path, this.context as FileContext, stylesBySlots),
    );
  }

  public override doRuntimeReplacement(): void {
    if (!this.#cssClassMap || !this.#cssRulesByBucket) {
      throw new Error('Styles are not extracted yet. Please call `build` first.');
    }

    const t = this.astService;
    const addAssetImport = (path: string) => t.addDefaultImport(path, 'asset');

    const uniqueRules = dedupeCSSRules(this.#cssRulesByBucket);
    const rulesObjectExpression = t.objectExpression(
      Object.entries(uniqueRules).map(([bucketName, cssRules]) =>
        t.objectProperty(
          t.identifier(bucketName),
          t.arrayExpression(
            cssRules.map(rule => {
              if (typeof rule === 'string') {
                return createRuleLiteral(this.path, t, this.context as FileContext, rule, addAssetImport);
              }

              const [cssRule, metadata] = rule;

              return t.arrayExpression([
                createRuleLiteral(this.path, t, this.context as FileContext, cssRule, addAssetImport),
                t.objectExpression(
                  Object.entries(metadata).map(([key, value]) =>
                    t.objectProperty(t.identifier(key), t.stringLiteral(value as string)),
                  ),
                ),
              ]);
            }),
          ),
        ),
      ),
    );

    const stylesImportIdentifier = t.addNamedImport('__styles', this.tagSource.source);
    const stylesCallExpression = t.callExpression(stylesImportIdentifier, [
      t.valueToNode(this.#cssClassMap),
      rulesObjectExpression,
    ]);

    this.replacer(stylesCallExpression, true);
  }
}
