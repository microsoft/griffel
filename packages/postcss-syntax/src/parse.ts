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
import type { CommentDirective } from './location-preset';
import * as os from 'os';

export type PostCSSParserOptions = Pick<postcss.ProcessOptions<postcss.Document | postcss.Root>, 'from' | 'map'>;

export interface ParserOptions extends Pick<PostCSSParserOptions, 'from'>, BabelPluginOptions {}

/**
 * Generates CSS rules from a JavaScript file. Each slot in `makeStyles` and each `makeResetStyles` will be one line in the output.
 * It returns a PostCSS AST that parses the generated CSS rules. For each node in AST, attaches information about its related slot location from the original js file.
 */
export const parse = (css: string | { toString(): string }, opts?: ParserOptions) => {
  const { from: filename = 'postcss-syntax.styles.ts' } = opts ?? {};
  const griffelPluginOptions = extractGriffelBabelPluginOptions(opts);
  const code = css.toString();
  const { metadata } = transformSync(code, {
    filename,
    pluginOptions: {
      ...griffelPluginOptions,
      generateMetadata: true,
    },
  });

  const {
    cssEntries,
    cssResetEntries,
    callExpressionLocations,
    resetLocations,
    locations,
    commentDirectives,
    resetCommentDirectives,
  } = metadata;

  const cssRuleSlotNames: string[] = [];
  const cssRules: string[] = [];

  Object.entries(cssEntries).forEach(([declarator, slots]) => {
    Object.entries(slots).forEach(([slot, rules]) => {
      cssRuleSlotNames.push(`${declarator} ${slot}`);
      let cssRule = rules.join('').replace(new RegExp(os.EOL, 'g'), ' ');

      const ignoredRules = getIgnoredRulesFromDirectives(commentDirectives[declarator]?.[slot] ?? []);
      if (ignoredRules.length) {
        const stylelintIgnore = `/* stylelint-disable-line ${ignoredRules.join(',')} */`;
        cssRule = `${cssRule} ${stylelintIgnore}`;
      }

      cssRules.push(cssRule);
    });
  });

  Object.entries(cssResetEntries).forEach(([declarator, resetRules]) => {
    cssRuleSlotNames.push(`${declarator}`);
    const ignoredRules = getIgnoredRulesFromDirectives(resetCommentDirectives[declarator] ?? []);
    let cssRule = resetRules.join('').replace(new RegExp(os.EOL, 'g'), ' ');

    if (ignoredRules.length) {
      const stylelintIgnore = `/* stylelint-disable-line ${ignoredRules.join(',')} */`;
      cssRule = `${cssRule} ${stylelintIgnore}`;
    }

    cssRules.push(cssRule);
  });

  const root = postcss.parse(cssRules.join('\n'), { from: filename });
  root.walk(node => {
    if (!node.source || node.source.start === undefined) {
      return;
    }
    const [declarator, slot] = cssRuleSlotNames[node.source.start.line - 1].split(' ');
    node.raws[GRIFFEL_DECLARATOR_RAW] = declarator;
    if (slot) {
      node.raws[GRIFFEL_SLOT_RAW] = slot;
      node.raws[GRIFFEL_SLOT_LOCATION_RAW] = locations[declarator]?.[slot] ?? callExpressionLocations[declarator];
    } else {
      node.raws[GRIFFEL_DECLARATOR_LOCATION_RAW] = resetLocations[declarator] ?? callExpressionLocations[declarator];
    }
  });

  root.raws[GRIFFEL_SRC_RAW] = css;
  return root;
};

function getIgnoredRulesFromDirectives(commentDirectives: CommentDirective[]) {
  return (
    commentDirectives
      .filter(([directive]) => directive === 'griffel-csslint-disable')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([_, rulename]) => rulename)
  );
}

const extractGriffelBabelPluginOptions = (opts: ParserOptions = {}) => {
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
