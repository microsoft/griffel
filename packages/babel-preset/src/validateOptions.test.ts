import type { File } from '@babel/types';
import type { Evaluator } from '@linaria/utils';

import { validateOptions } from './validateOptions';
import { BabelPluginOptions } from './types';

describe('validateOptions', () => {
  describe('babelOptions', () => {
    it('passes on valid options', () => {
      const pluginOptions: BabelPluginOptions = {
        babelOptions: {
          presets: ['@babel/preset'],
          plugins: ['@babel/transformPlugin'],
        },
      };

      expect(() => validateOptions(pluginOptions)).not.toThrow();
    });

    it('throws when babelOptions is not valid', () => {
      const pluginOptions = { babelOptions: [] };

      // @ts-expect-error Invalid options are passed for testing purposes
      expect(() => validateOptions(pluginOptions)).toThrowErrorMatchingInlineSnapshot(
        `"Validation failed for passed config: data/babelOptions must be object"`,
      );
    });

    it('throws when generateMetadata is not valid', () => {
      const pluginOptions = { generateMetadata: 3 };

      // @ts-expect-error Invalid options are passed for testing purposes
      expect(() => validateOptions(pluginOptions)).toThrowErrorMatchingInlineSnapshot(
        `"Validation failed for passed config: data/generateMetadata must be boolean"`,
      );
    });
  });

  describe('evaluationRules', () => {
    it('passes on valid options', () => {
      const noopEvaluator: Evaluator = () => [null as unknown as File, 'foo', null];
      const pluginOptions: BabelPluginOptions = {
        evaluationRules: [
          { action: noopEvaluator },
          { action: noopEvaluator, test: () => true },
          { action: 'ignore', test: /foo/ },
        ],
      };

      expect(() => validateOptions(pluginOptions)).not.toThrow();
    });

    it('throws on wrong options', () => {
      const pluginOptionsA = { evaluationRules: {} };

      // @ts-expect-error Invalid options are passed for testing purposes
      expect(() => validateOptions(pluginOptionsA)).toThrowErrorMatchingInlineSnapshot(
        `"Validation failed for passed config: data/evaluationRules must be array"`,
      );
    });
  });
});
