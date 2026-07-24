import type { Node } from 'oxc-parser';

export interface StyleCall {
  declaratorId: string;
  functionKind: 'makeStyles' | 'makeResetStyles' | 'makeStaticStyles';
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
