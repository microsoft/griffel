import type { Comment, Node, Program } from 'oxc-parser';
import { normalizeCSSBucketEntry, type CSSClassesMapBySlot, type CSSRulesByBucket } from '@griffel/core';

import { createLineOffsetTable, type LineOffsetTable } from './sourceLocation.mjs';
import type {
  StyleCall,
  TransformMetadata,
  TransformMetadataCommentDirective,
  TransformMetadataSourceLocation,
} from './types.mjs';

type ObjectExpressionNode = Extract<Node, { type: 'ObjectExpression' }>;

/** CSS output produced while transforming a `makeStyles()` call. */
export type StylesCSSOutput = {
  classnamesMapping: CSSClassesMapBySlot<string>;
  resolvedCSSRules: CSSRulesByBucket;
};

/** CSS output produced while transforming a `makeResetStyles()` call. */
export type ResetCSSOutput = string[] | CSSRulesByBucket;

/**
 * A single style call paired with the CSS output produced while transforming it. This is the
 * per-call contract consumed by `generateMetadata()`: the caller emits one entry per style call,
 * in source order, so that no lookup by declarator id is required.
 */
export type ProcessedStyleCall = { styleCall: StyleCall } & (
  | { functionKind: 'makeStyles'; css: StylesCSSOutput }
  | { functionKind: 'makeResetStyles'; css: ResetCSSOutput }
  | { functionKind: 'makeStaticStyles' }
);

export type GenerateMetadataOptions = {
  source: string;
  program: Program;
  comments: Comment[];
  processedStyleCalls: ProcessedStyleCall[];
};

/**
 * Builds transform metadata (CSS entries, source locations, comment directives) from the collected
 * style calls and their resolved CSS output.
 *
 * Style calls are iterated in source order, so all entries (and their keys) are produced
 * top-to-bottom, matching the order in which consumers (e.g. `@griffel/postcss-syntax`) emit CSS.
 */
export function generateMetadata(options: GenerateMetadataOptions): TransformMetadata {
  const { source, program, comments, processedStyleCalls } = options;

  const offsets = createLineOffsetTable(source);
  const metadata: TransformMetadata = {
    cssEntries: {},
    cssResetEntries: {},
    callExpressionLocations: {},
    locations: {},
    resetLocations: {},
    commentDirectives: {},
    resetCommentDirectives: {},
  };

  for (const processed of processedStyleCalls) {
    const { styleCall } = processed;
    const { declaratorId, argumentNode } = styleCall;

    metadata.callExpressionLocations[declaratorId] = offsets.locate(styleCall.callStart, styleCall.callEnd);

    switch (processed.functionKind) {
      case 'makeStyles': {
        metadata.cssEntries[declaratorId] = getSlotCSSEntries(
          processed.css.classnamesMapping,
          processed.css.resolvedCSSRules,
        );

        if (argumentNode.type === 'ObjectExpression') {
          const slots = collectSlotMetadata(argumentNode, comments, offsets);

          metadata.locations[declaratorId] = slots.locations;
          metadata.commentDirectives[declaratorId] = slots.commentDirectives;
        }

        break;
      }

      case 'makeResetStyles': {
        metadata.cssResetEntries[declaratorId] = getResetCSSEntries(processed.css);

        if (argumentNode.type === 'ObjectExpression') {
          metadata.resetLocations[declaratorId] = offsets.locate(argumentNode.start, argumentNode.end);
        }

        const directives = collectResetCommentDirectives(styleCall, program, comments);

        if (directives.length > 0) {
          metadata.resetCommentDirectives[declaratorId] = directives;
        }

        break;
      }

      case 'makeStaticStyles': {
        // `makeStaticStyles()` produces no per-slot metadata.
        break;
      }
    }
  }

  return metadata;
}

/**
 * Maps each `makeStyles()` slot to its unique CSS rules, matching class names against the resolved
 * rules produced by `resolveStyleRulesForSlots()`.
 */
function getSlotCSSEntries(
  classnamesMapping: CSSClassesMapBySlot<string>,
  resolvedCSSRules: CSSRulesByBucket,
): Record<string, string[]> {
  const cssRules = flattenCSSRules(resolvedCSSRules);

  const slotEntries = Object.entries(classnamesMapping).map(([slot, cssClassesMap]) => {
    const classNames = new Set<string>();

    for (const cssClasses of Object.values(cssClassesMap)) {
      if (typeof cssClasses === 'string') {
        classNames.add(cssClasses);
      } else if (Array.isArray(cssClasses)) {
        for (const cssClass of cssClasses) {
          classNames.add(cssClass);
        }
      }
    }

    const rules = Array.from(classNames, cssClass => cssRules.find(rule => rule.includes(cssClass))!);

    return [slot, rules] as const;
  });

  return Object.fromEntries(slotEntries);
}

/**
 * Flattens the CSS rules from every bucket of a `makeResetStyles()` call into a single list.
 */
function getResetCSSEntries(cssRules: ResetCSSOutput): string[] {
  const cssRulesByBucket: CSSRulesByBucket = Array.isArray(cssRules) ? { d: cssRules } : cssRules;

  return Object.values(cssRulesByBucket).flatMap(bucketEntries =>
    bucketEntries.map(bucketEntry => {
      if (Array.isArray(bucketEntry)) {
        throw new Error(
          `CSS rules in buckets for "makeResetStyles()" should not contain arrays, got: ${JSON.stringify(
            bucketEntry,
          )})}`,
        );
      }

      return bucketEntry;
    }),
  );
}

function flattenCSSRules(cssRulesByBucket: CSSRulesByBucket): string[] {
  return Object.values(cssRulesByBucket).flatMap(bucketEntries =>
    bucketEntries.map(bucketEntry => normalizeCSSBucketEntry(bucketEntry)[0]),
  );
}

/**
 * Collects the source location and comment directives of every named slot in a `makeStyles()`
 * object argument, in a single pass over its properties.
 */
function collectSlotMetadata(
  objectExpression: ObjectExpressionNode,
  comments: Comment[],
  offsets: LineOffsetTable,
): {
  locations: Record<string, TransformMetadataSourceLocation>;
  commentDirectives: Record<string, TransformMetadataCommentDirective[]>;
} {
  const locations: Record<string, TransformMetadataSourceLocation> = {};
  const commentDirectives: Record<string, TransformMetadataCommentDirective[]> = {};

  // Comment directives attached to a slot live between the previous property and this one.
  let precedingEnd = objectExpression.start;

  for (const property of objectExpression.properties) {
    const commentRangeStart = precedingEnd;
    precedingEnd = property.end;

    if (property.type !== 'Property') {
      continue;
    }

    const { key } = property;

    if (key.type !== 'Identifier') {
      continue;
    }

    locations[key.name] = offsets.locate(property.start, property.end);

    const directives = parseCommentDirectives(comments, commentRangeStart, property.start);

    if (directives.length > 0) {
      commentDirectives[key.name] = directives;
    }
  }

  return { locations, commentDirectives };
}

/**
 * Collects comment directives that precede the top-level statement containing a `makeResetStyles()`
 * call (i.e. the `VariableDeclaration` or `ExportNamedDeclaration`).
 */
function collectResetCommentDirectives(
  styleCall: StyleCall,
  program: Program,
  comments: Comment[],
): TransformMetadataCommentDirective[] {
  const leadingRange = getLeadingCommentRange(program, styleCall.callStart, styleCall.callEnd);

  if (!leadingRange) {
    return [];
  }

  return parseCommentDirectives(comments, leadingRange.start, leadingRange.end);
}

/**
 * Returns the offset range in which leading comments for the top-level statement containing
 * `[callStart, callEnd)` can appear: from the end of the previous statement to the statement start.
 */
function getLeadingCommentRange(
  program: Program,
  callStart: number,
  callEnd: number,
): { start: number; end: number } | undefined {
  const containingStatement = program.body.find(statement => statement.start <= callStart && statement.end >= callEnd);

  if (!containingStatement) {
    return undefined;
  }

  let start = 0;

  for (const statement of program.body) {
    if (statement.start >= containingStatement.start) {
      break;
    }

    start = statement.end;
  }

  return { start, end: containingStatement.start };
}

/**
 * Parses `griffel-` prefixed line comments within `[rangeStart, rangeEnd)` into `[name, value]`
 * directives.
 */
function parseCommentDirectives(
  comments: Comment[],
  rangeStart: number,
  rangeEnd: number,
): TransformMetadataCommentDirective[] {
  const directives: TransformMetadataCommentDirective[] = [];

  for (const comment of comments) {
    if (comment.type !== 'Line') {
      continue;
    }

    if (comment.start < rangeStart || comment.start >= rangeEnd) {
      continue;
    }

    const value = comment.value.trim();

    if (!value.startsWith('griffel-')) {
      continue;
    }

    const [name, directiveValue] = value.split(' ');
    directives.push([name, directiveValue]);
  }

  return directives;
}
