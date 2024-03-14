import * as postcss from 'postcss';
import transformSync from './transform-sync';
import { GRIFFEL_DECLARATOR_RAW, GRIFFEL_SLOT_RAW, GRIFFEL_SRC_RAW } from './constants';
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

  const cssRuleNodes = Object.entries(cssEntries)
    .map(([declarator, slots]) => {
      return Object.entries(slots).reduce((arr, [slot, rules]) => {
        if (!locations[declarator][slot]) {
          throw new Error(`No code location for ${declarator}:${slot} - please report a bug`);
        }

        const location = locations[declarator][slot];

        const nodes = rules.map(rule => {
          const root = postcss.parse(rule);
          root.walk(node => {
            node.raws[GRIFFEL_SLOT_RAW] = slot;
            node.raws[GRIFFEL_DECLARATOR_RAW] = declarator;

            if (!node.source) {
              return;
            }

            // There's currently no way to to map generated CSS to original JS code
            // Mapping each node to the original slot is probably the best we can do for now
            node.source.end = {
              offset: 0,
              column: location.end.column,
              line: location.end.line,
            };

            node.source.start = {
              offset: 0,
              column: location.start.column,
              line: location.start.line,
            };
          });

          return root.nodes[0];
        });
        return [...arr, ...nodes];
      }, [] as postcss.ChildNode[]);
    })
    .flat();

  const cssResetRuleNodes = Object.entries(cssResetEntries).map(([declarator, [resetRule]]) => {
    if (!resetLocations[declarator]) {
      throw new Error(`No code location for ${declarator} - please report a bug`);
    }

    const location = resetLocations[declarator];

    const root = postcss.parse(resetRule);
    root.walk(node => {
      node.raws[GRIFFEL_DECLARATOR_RAW] = declarator;

      if (!node.source) {
        return;
      }

      // There's currently no way to to map generated CSS to original JS code through Griffel AOT
      // Mapping each node to the original slot is probably the best we can do for now
      node.source.end = {
        offset: 0,
        column: location.end.column,
        line: location.end.line,
      };

      node.source.start = {
        offset: 0,
        column: location.start.column,
        line: location.start.line,
      };
    });

    return root.nodes[0];
  });

  const root = new postcss.Root();
  const allNodes = cssRuleNodes.concat(cssResetRuleNodes);
  for (const rule of allNodes) {
    root.append(rule);
  }

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
