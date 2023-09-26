import { AST_NODE_TYPES, ASTUtils, TSESTree } from '@typescript-eslint/utils';

type IsHelper<NodeType extends AST_NODE_TYPES> = (node: TSESTree.Node | null | undefined) => node is TSESTree.Node & {
  type: NodeType;
};

export const isIdentifier: IsHelper<AST_NODE_TYPES.Identifier> = ASTUtils.isIdentifier;
export const isLiteral: IsHelper<AST_NODE_TYPES.Literal> = ASTUtils.isNodeOfType(AST_NODE_TYPES.Literal);
export const isMemberExpression: IsHelper<AST_NODE_TYPES.MemberExpression> = ASTUtils.isNodeOfType(
  AST_NODE_TYPES.MemberExpression,
);
export const isObjectExpression: IsHelper<AST_NODE_TYPES.ObjectExpression> = ASTUtils.isNodeOfType(
  AST_NODE_TYPES.ObjectExpression,
);
export const isProperty: IsHelper<AST_NODE_TYPES.Property> = ASTUtils.isNodeOfType(AST_NODE_TYPES.Property);

export function isStringLiteral(node: TSESTree.Node | null | undefined): node is TSESTree.StringLiteral {
  return isLiteral(node) && typeof node.value === 'string';
}

type MakeStylesName = 'makeStyles' | 'makeStaticStyles' | 'makeResetStyles';

/**
 * Checks if the given node is a `makeStyles` call expression.
 * @param node Call expression node in AST to check.
 * @param functionNames Function names to check, such as `makeStyles`, `makeStaticStyles`, `makeResetStyles`.
 * Must pass at least one name.
 */
export function isMakeStylesCallExpression(
  node: TSESTree.CallExpression,
  ...functionNames: [MakeStylesName, ...MakeStylesName[]]
): boolean {
  const { callee } = node;
  const names: ReadonlySet<string> = new Set(functionNames);

  if (isIdentifier(callee)) {
    // makeStyles({})
    return names.has(callee.name);
  } else if (isMemberExpression(callee)) {
    return (
      // something.makeStyles({})
      (isIdentifier(callee.property) && names.has(callee.property.name)) ||
      // something['makeStyles']({})
      (isStringLiteral(callee.property) && names.has(callee.property.value))
    );
  } else {
    return false;
  }
}
