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
