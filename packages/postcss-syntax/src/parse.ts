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

  const cssRuleKeys: string[] = [];
  const cssRules: string[] = [];

  Object.entries(cssEntries).map(([declarator, slots]) => {
    Object.entries(slots).map(([slot, rules]) => {
      cssRuleKeys.push(`${declarator} ${slot}`);
      cssRules.push(rules.join(''));
    });
  });

  Object.entries(cssResetEntries).map(([declarator, resetRules]) => {
    cssRuleKeys.push(`${declarator}`);
    cssRules.push(resetRules.join(''));
  });

  const root = postcss.parse(cssRules.join('\n'));
  root.walk(node => {
    if (!node.source || node.source.start === undefined) {
      return;
    }
    const [declarator, slot] = cssRuleKeys[node.source.start.line - 1].split(' ');
    node.raws[GRIFFEL_DECLARATOR_RAW] = declarator;
    if (slot) {
      node.raws[GRIFFEL_SLOT_RAW] = slot;
      node.raws[GRIFFEL_SLOT_LOCATION_RAW] = locations[declarator][slot];
    } else {
      node.raws[GRIFFEL_DECLARATOR_LOCATION_RAW] = resetLocations[declarator];
    }
  });

  const doc = new postcss.Document();

  root.parent = doc;
  // https://github.com/callstack/linaria/blob/911b59b0b8bb7de2accce63ece528841f2b29f4a/packages/postcss-linaria/src/parse.ts#L180
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  root.document = doc;
  doc.nodes.push(root);

  doc.source = {
    input: new postcss.Input(code),
    start: {
      line: 1,
      column: 1,
      offset: 0,
    },
  };

  doc.raws[GRIFFEL_SRC_RAW] = css;
  return doc;
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
