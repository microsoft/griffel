import { recommendedConfig } from './configs/recommended';
import { noShorthandsRule } from './rules/no-shorthands';

export = {
  configs: {
    recommended: recommendedConfig,
  },
  rules: {
    'no-shorthands': noShorthandsRule,
  },
};
