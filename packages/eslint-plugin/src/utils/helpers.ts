import { AST_NODE_TYPES, ASTUtils, TSESTree } from '@typescript-eslint/utils';

type IsHelper<NodeType extends AST_NODE_TYPES> = (node: TSESTree.Node | null | undefined) => node is TSESTree.Node & {
  type: NodeType;
};

export const isIdentifier: IsHelper<AST_NODE_TYPES.Identifier> = ASTUtils.isIdentifier;
export const isLiteral: IsHelper<AST_NODE_TYPES.Literal> = ASTUtils.isNodeOfType(AST_NODE_TYPES.Literal);
export const isObjectExpression: IsHelper<AST_NODE_TYPES.ObjectExpression> = ASTUtils.isNodeOfType(
  AST_NODE_TYPES.ObjectExpression,
);
export const isProperty: IsHelper<AST_NODE_TYPES.Property> = ASTUtils.isNodeOfType(AST_NODE_TYPES.Property);

export function isMakeStylesIdentifier(node: TSESTree.Node | null | undefined): node is TSESTree.Identifier {
  return isIdentifier(node) && node.name === 'makeStyles';
}

export function isMakeResetStylesIdentifier(node: TSESTree.Node | null | undefined): node is TSESTree.Identifier {
  return isIdentifier(node) && node.name === 'makeResetStyles';
}

export function isStringLiteral(node: TSESTree.Node | null | undefined): node is TSESTree.StringLiteral {
  return isLiteral(node) && typeof node.value === 'string';
}
