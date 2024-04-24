import * as postcss from 'postcss';
import transformSync from './transform-sync';
import {
  GRIFFEL_DECLARATOR_LOCATION_RAW,
  GRIFFEL_DECLARATOR_RAW,
  GRIFFEL_SLOT_LOCATION_RAW,
  GRIFFEL_SLOT_RAW,
  GRIFFEL_SRC_RAW,
} from './constants';
import type { BabelPluginOptions } from '@griffel/babel-preset';

export type PostCSSParserOptions = Pick<postcss.ProcessOptions<postcss.Document | postcss.Root>, 'from' | 'map'>;

export interface ParserOptions extends PostCSSParserOptions, BabelPluginOptions {}

/**
 * Generates CSS rules from a JavaScript file. Each slot in `makeStyles` and each `makeResetStyles` will be one line in the output.
 * It returns a PostCSS AST that parses the generated CSS rules and attaches information about the source location for each slot in the original JavaScript file.
 */
export const parse = (css: string | { toString(): string }, opts?: ParserOptions) => {
  const { from: filename = 'postcss-syntax.styles.ts' } = opts ?? {};
  const griffelPluginOptions = extractGrifellBabelPluginOptions(opts);
  const code = css.toString();
  const { metadata } = transformSync(code, {
    filename,
    pluginOptions: {
      ...griffelPluginOptions,
      generateMetadata: true,
    },
  });

  const { cssEntries, cssResetEntries, resetLocations, locations } = metadata;

  const cssRuleSlotNames: string[] = [];
  const cssRules: string[] = [];

  Object.entries(cssEntries).map(([declarator, slots]) => {
    Object.entries(slots).map(([slot, rules]) => {
      cssRuleSlotNames.push(`${declarator} ${slot}`);
      cssRules.push(rules.join(''));
    });
  });

  Object.entries(cssResetEntries).map(([declarator, resetRules]) => {
    cssRuleSlotNames.push(`${declarator}`);
    cssRules.push(resetRules.join(''));
  });

  const root = postcss.parse(cssRules.join('\n'));
  root.walk(node => {
    if (!node.source || node.source.start === undefined) {
      return;
    }
    const [declarator, slot] = cssRuleSlotNames[node.source.start.line - 1].split(' ');
    node.raws[GRIFFEL_DECLARATOR_RAW] = declarator;
    if (slot) {
      node.raws[GRIFFEL_SLOT_RAW] = slot;
      node.raws[GRIFFEL_SLOT_LOCATION_RAW] = locations[declarator][slot];
    } else {
      node.raws[GRIFFEL_DECLARATOR_LOCATION_RAW] = resetLocations[declarator];
    }
  });

  root.raws[GRIFFEL_SRC_RAW] = css;
  return root;
};

const extractGrifellBabelPluginOptions = (opts: ParserOptions = {}) => {
  const { babelOptions, evaluationRules, generateMetadata, modules } = opts;
  const babelPluginOptions: BabelPluginOptions = {};
  if (babelOptions) {
    babelPluginOptions.babelOptions = babelOptions;
  }

  if (evaluationRules) {
    babelPluginOptions.evaluationRules = evaluationRules;
  }

  if (generateMetadata) {
    babelPluginOptions.generateMetadata = generateMetadata;
  }

  if (modules) {
    babelPluginOptions.modules = modules;
  }

  return babelPluginOptions;
};
