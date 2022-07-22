import { NodePath, traverse, types as t } from '@babel/core';
import * as path from 'path';

import { parseStringWithUrl } from './parseStringWithUrl';

export function absolutePathToRelative(projectRoot: string, filename: string, assetPath: string) {
  const fileDirectory = path.dirname(filename);

  const absoluteAssetPath = path.resolve(projectRoot, assetPath);
  const assetDirectory = path.dirname(absoluteAssetPath);

  if (fileDirectory === assetDirectory) {
    return './' + path.basename(assetPath);
  }

  return path.relative(fileDirectory, absoluteAssetPath);
}

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

  traverse(
    pathToUpdate.node,
    {
      StringLiteral(literalPath) {
        const value = literalPath.node.value;

        if (value.indexOf('url(') === -1) {
          return;
        }

        const result = parseStringWithUrl(value);
        const assetIdentifier = getAssetIdentifier(result.url);

        const templateLiteral = t.templateLiteral(
          [t.templateElement({ raw: result.prefix }, false), t.templateElement({ raw: result.suffix }, true)],
          [assetIdentifier],
        );

        literalPath.replaceWith(templateLiteral);
      },
    },
    programPath.scope,
    programPath,
  );

  for (const [importPath, identifier] of assetIdentifiers.entries()) {
    const relativePath = absolutePathToRelative(projectRoot, filename, importPath);

    programPath.unshiftContainer(
      'body',
      t.importDeclaration([t.importDefaultSpecifier(identifier)], t.stringLiteral(relativePath)),
    );
  }
}
