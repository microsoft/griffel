import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

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
export const isTemplateLiteral: IsHelper<AST_NODE_TYPES.TemplateLiteral> = ASTUtils.isNodeOfType(
  AST_NODE_TYPES.TemplateLiteral,
);

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
  return getMakeStylesCallExpression(node, ...functionNames) !== null;
}

export function getMakeStylesCallExpression(
  node: TSESTree.CallExpression,
  ...functionNames: [MakeStylesName, ...MakeStylesName[]]
) {
  const { callee } = node;
  const names: ReadonlySet<string> = new Set(functionNames);

  if (isIdentifier(callee) && names.has(callee.name)) {
    // makeStyles({})
    return callee.name;
  } else if (isMemberExpression(callee)) {
    // something.makeStyles({})
    if (isIdentifier(callee.property) && names.has(callee.property.name)) {
      return callee.property.name;
    }

    // something['makeStyles']({})
    if (isStringLiteral(callee.property) && names.has(callee.property.value)) {
      return callee.property.value;
    }
  }

  return null;
}

const MATCHING_PACKAGES = new Set(['@fluentui/react-components', '@griffel/core', '@griffel/react']);

function isMatchingPackage(packageName: string) {
  return MATCHING_PACKAGES.has(packageName);
}

/**
 * @param node - import node from AST
 * @returns true if makeStyles is imported, or if the entire library is imported. Otherwise returns false
 */
export function isMakeStylesImport(node: TSESTree.ImportDeclaration) {
  return (
    isMatchingPackage(node.source.value) &&
    node.specifiers.filter(specifier => {
      // import * as ... from
      if (specifier.type === 'ImportNamespaceSpecifier') {
        return true;
      }

      if ('imported' in specifier) {
        return (
          specifier.imported.name === 'makeStyles' || // import { makeStyles } from
          specifier.imported.name === 'makeStaticStyles' || // import { makeStaticStyles } from
          specifier.imported.name === 'makeResetStyles' // import { makeResetStyles } from
        );
      }

      return false;
    }).length > 0
  );
}
