import type { ESLintUtils } from '@typescript-eslint/utils';

import { hookNamingRule } from './rules/hook-naming.js';
import { noInvalidShorthandArgumentRule } from './rules/no-invalid-shorthand-argument.js';
import { noShorthandsRule } from './rules/no-shorthands.js';
import { pseudoElementNamingRule } from './rules/pseudo-element-naming.js';
import { stylesFileRule } from './rules/styles-file.js';
import { noDeprecatedShorthandsRule } from './rules/no-deprecated-shorthands.js';
import { stylesFileRule as topLevelStylesRule } from './rules/top-level-styles.js';

const rules: Record<string, ESLintUtils.RuleModule<string, unknown[]>> = {
  'hook-naming': hookNamingRule,
  'no-invalid-shorthand-argument': noInvalidShorthandArgumentRule,
  'no-shorthands': noShorthandsRule,
  'styles-file': stylesFileRule,
  'pseudo-element-naming': pseudoElementNamingRule,
  'no-deprecated-shorthands': noDeprecatedShorthandsRule,
  'top-level-styles': topLevelStylesRule,
};

const plugin = {
  configs: {} as Record<string, unknown>,
  rules,
};

plugin.configs['recommended'] = {
  plugins: {
    '@griffel': plugin,
  },
  rules: {
    '@griffel/hook-naming': 'error',
    '@griffel/no-invalid-shorthand-argument': 'error',
    '@griffel/no-shorthands': 'error',
    '@griffel/pseudo-element-naming': 'error',
    '@griffel/no-deprecated-shorthands': 'error',
    '@griffel/styles-file': 'error',
    '@griffel/top-level-styles': 'error',
  },
};

export default plugin;
