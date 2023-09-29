import { recommendedConfig } from './configs/recommended';
import { hookNamingRule } from './rules/hook-naming';
import { noShorthandsRule } from './rules/no-shorthands';
import { pseudoElementNamingRule } from './rules/pseudo-element-naming';
import { stylesFileRule } from './rules/styles-file';

export = {
  configs: {
    recommended: recommendedConfig,
  },
  rules: {
    'hook-naming': hookNamingRule,
    'no-shorthands': noShorthandsRule,
    'styles-file': stylesFileRule,
    'pseudo-element-naming': pseudoElementNamingRule,
  },
};
