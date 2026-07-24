import * as postcss from 'postcss';
import { transformSync as griffelTransformSync } from '@griffel/transform';
import {
  GRIFFEL_DECLARATOR_LOCATION_RAW,
  GRIFFEL_DECLARATOR_RAW,
  GRIFFEL_SLOT_LOCATION_RAW,
  GRIFFEL_SLOT_RAW,
  GRIFFEL_SRC_RAW,
} from './constants.js';
import { nodeResolve } from './resolveModule.js';
import type {
  CommentDirective,
  TransformMetadata,
  TransformOptions as GriffelTransformOptions,
} from '@griffel/transform';
import * as os from 'os';

export type PostCSSParserOptions = Pick<postcss.ProcessOptions<postcss.Document | postcss.Root>, 'from' | 'map'>;

type ModuleMatchingOptions = Pick<GriffelTransformOptions, 'importsToTransform' | 'functionsToTransform'>;

export interface ParserOptions extends Pick<PostCSSParserOptions, 'from'>, ModuleMatchingOptions {
  /**
   * Throws error when griffel parsing fails
   * @default false
   */
  silenceParseErrors?: boolean;
}

/**
 * Generates CSS rules from a JavaScript file. Each slot in `makeStyles` and each `makeResetStyles` will be one line in the output.
 * It returns a PostCSS AST that parses the generated CSS rules. For each node in AST, attaches information about its related slot location from the original js file.
 */
export const parse = (css: string | { toString(): string }, opts?: ParserOptions) => {
  const { from: filename = 'postcss-syntax.styles.ts', silenceParseErrors = false } = opts ?? {};
  const pluginOptions = extractPluginOptions(opts);
  const code = css.toString();

  const cssRuleSlotNames: string[] = [];
  const cssRules: string[] = [];

  const parseResult = parseGriffelStyles(code, filename, pluginOptions, silenceParseErrors);
  if (!parseResult) {
    const root = postcss.parse(`/* Failed to parse griffel styles: ${filename} */`, { from: filename });
    root.raws[GRIFFEL_SRC_RAW] = code;
    return root;
  }

  const {
    cssEntries,
    cssResetEntries,
    callExpressionLocations,
    resetLocations,
    locations,
    commentDirectives,
    resetCommentDirectives,
  } = parseResult;

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

function parseGriffelStyles(
  code: string,
  filename: string,
  pluginOpts: ModuleMatchingOptions,
  silenceParseErrors: boolean,
): TransformMetadata | null {
  try {
    const { metadata } = griffelTransformSync(code, {
      filename,
      resolveModule: nodeResolve,
      generateMetadata: true,
      ...pluginOpts,
    });

    return metadata ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to parse Griffel styles');
    // eslint-disable-next-line no-console
    console.warn(error);
    if (silenceParseErrors) {
      return null;
    }

    throw error;
  }
}

function getIgnoredRulesFromDirectives(commentDirectives: CommentDirective[]) {
  return commentDirectives
    .filter(([directive]) => directive === 'griffel-csslint-disable')
    .map(([_, rulename]) => rulename);
}

const extractPluginOptions = (opts: ParserOptions = {}) => {
  const { importsToTransform, functionsToTransform } = opts;
  const pluginOptions: ModuleMatchingOptions = {};

  if (importsToTransform) {
    pluginOptions.importsToTransform = importsToTransform;
  }

  if (functionsToTransform) {
    pluginOptions.functionsToTransform = functionsToTransform;
  }

  return pluginOptions;
};
