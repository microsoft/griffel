import type { Node } from 'oxc-parser';

/** Functions used in a source code, they are transformed to their runtime counterparts. */
export type SourceFunctionKind = 'makeStyles' | 'makeResetStyles' | 'makeStaticStyles';

/**
 * Functions emitted by "@griffel/babel-preset" i.e. present in packages that are precompiled ahead of time.
 * CSS rules in them are already resolved and only have to be evaluated & stripped.
 */
export type PrecompiledFunctionKind = '__styles' | '__resetStyles' | '__staticStyles';

export type StyleCallKind = SourceFunctionKind | PrecompiledFunctionKind;

export interface StyleCall {
  declaratorId: string;
  functionKind: StyleCallKind;
  /**
   * A range that is replaced in the output. For precompiled calls it also contains a leading comma as the
   * argument with CSS rules is removed instead of being replaced.
   */
  argumentStart: number;
  argumentEnd: number;
  argumentCode: string;
  argumentNode: Node;
  callStart: number;
  callEnd: number;
  importId: string;
}

export interface TransformMetadataSourceLocation {
  start: { line: number; column: number; index: number };
  end: { line: number; column: number; index: number };
}

export type TransformMetadataCommentDirective = [string, string];

export interface TransformMetadata {
  cssEntries: Record<string, Record<string, string[]>>;
  cssResetEntries: Record<string, string[]>;
  callExpressionLocations: Record<string, TransformMetadataSourceLocation>;
  locations: Record<string, Record<string, TransformMetadataSourceLocation>>;
  resetLocations: Record<string, TransformMetadataSourceLocation>;
  commentDirectives: Record<string, Record<string, TransformMetadataCommentDirective[]>>;
  resetCommentDirectives: Record<string, TransformMetadataCommentDirective[]>;
}
