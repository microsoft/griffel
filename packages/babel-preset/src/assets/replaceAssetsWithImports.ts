import { NodePath, traverse, types as t } from '@babel/core';
import * as path from 'path';
import { tokenize } from 'stylis';

import { absolutePathToRelative } from './absolutePathToRelative';
import { isAssetUrl } from './isAssetUrl';

/**
 * Replaces assets used in styles with imports and template literals.
 *
 * @example
 * "['.foo { background-image: url(image.png) }"
 * // to
 * import _asset from 'image.png'
 * `['.foo { background-image: url(${_asset}) }`
 */
export function replaceAssetsWithImports(
  projectRoot: string,
  filename: string,
  programPath: NodePath<t.Program>,
  pathToUpdate: NodePath,
) {
  const assetIdentifiers = new Map<string, t.Identifier>();

  function getAssetIdentifier(assetPath: string): t.Identifier {
    if (!assetIdentifiers.has(assetPath)) {
      assetIdentifiers.set(assetPath, programPath.scope.generateUidIdentifier('asset'));
    }

    return assetIdentifiers.get(assetPath) as t.Identifier;
  }

  function buildTemplateLiteralFromValue(value: string): t.TemplateLiteral {
    const tokens = tokenize(value);

    const quasis: t.TemplateElement[] = [];
    const expressions: t.Identifier[] = [];

    let acc = '';

    for (let i = 0, l = tokens.length; i < l; i++) {
      for (; i < l; i++) {
        acc += tokens[i];

        if (tokens[i] === 'url') {
          const url = tokens[i + 1].slice(1, -1);

          if (isAssetUrl(url)) {
            quasis.push(t.templateElement({ raw: acc + '(' }, false));
            expressions.push(getAssetIdentifier(url));

            acc = ')';
            i++;

            break;
          }
        }
      }
    }

    quasis.push(t.templateElement({ raw: acc }, true));

    return t.templateLiteral(quasis, expressions);
  }

  traverse(
    pathToUpdate.node,
    {
      StringLiteral(literalPath) {
        const value = literalPath.node.value;

        if (value.indexOf('url(') === -1) {
          return;
        }

        literalPath.replaceWith(buildTemplateLiteralFromValue(value));
      },
    },
    programPath.scope,
    programPath,
  );

  for (const [importPath, identifier] of assetIdentifiers.entries()) {
    const relativePath = absolutePathToRelative(path, projectRoot, filename, importPath);

    programPath.unshiftContainer(
      'body',
      t.importDeclaration([t.importDefaultSpecifier(identifier)], t.stringLiteral(relativePath)),
    );
  }
}
