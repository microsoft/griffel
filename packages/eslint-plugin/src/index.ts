import type { ESLintUtils } from '@typescript-eslint/utils';

import { recommendedConfig } from './configs/recommended';
import { hookNamingRule } from './rules/hook-naming';
import { noInvalidShorthandArgumentRule } from './rules/no-invalid-shorthand-argument';
import { noShorthandsRule } from './rules/no-shorthands';
import { pseudoElementNamingRule } from './rules/pseudo-element-naming';
import { stylesFileRule } from './rules/styles-file';
import { noDeprecatedShorthandsRule } from './rules/no-deprecated-shorthands';

const rules: Record<string, ESLintUtils.RuleModule<string, unknown[]>> = {
  'hook-naming': hookNamingRule,
  'no-invalid-shorthand-argument': noInvalidShorthandArgumentRule,
  'no-shorthands': noShorthandsRule,
  'styles-file': stylesFileRule,
  'pseudo-element-naming': pseudoElementNamingRule,
  'no-deprecated-shorthands': noDeprecatedShorthandsRule,
};

const plugin = {
  configs: {
    recommended: recommendedConfig,
  },
  rules,
};

export = plugin;
