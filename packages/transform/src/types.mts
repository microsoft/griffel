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

export interface SourceLocation {
  start: { line: number; column: number; index: number };
  end: { line: number; column: number; index: number };
}

export type CommentDirective = [string, string];

export interface TransformMetadata {
  cssEntries: Record<string, Record<string, string[]>>;
  cssResetEntries: Record<string, string[]>;
  callExpressionLocations: Record<string, SourceLocation>;
  locations: Record<string, Record<string, SourceLocation>>;
  resetLocations: Record<string, SourceLocation>;
  commentDirectives: Record<string, Record<string, CommentDirective[]>>;
  resetCommentDirectives: Record<string, CommentDirective[]>;
}

export interface ModuleConfig {
  moduleSource: string;
  importName?: string;
  resetImportName?: string;
  staticImportName?: string;
}
