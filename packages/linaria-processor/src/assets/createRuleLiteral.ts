import type { types as t } from '@babel/core';
import { tokenize } from 'stylis';

import { relativePathToImportLike } from './relativePathToImportLike';
import type { FileContext } from '../types';

export function createRuleLiteral(
  path: typeof import('path'),
  astService: typeof t,
  fileContext: FileContext,
  rule: string,
  addAssetImport: (path: string) => t.Identifier,
): t.StringLiteral | t.TemplateLiteral {
  if (rule.indexOf('url(') === -1) {
    return astService.stringLiteral(rule);
  }

  const tokens = tokenize(rule);

  const quasis: t.TemplateElement[] = [];
  const expressions: t.Identifier[] = [];

  let acc = '';

  for (let i = 0, l = tokens.length; i < l; i++) {
    acc += tokens[i];

    if (tokens[i] === 'url') {
      const url = tokens[i + 1].slice(1, -1);

      if (url.startsWith('griffel:')) {
        // Handle `filter: url(./a.svg#id)`
        const [pathname, hash] = url.slice(8).split('#');

        quasis.push(astService.templateElement({ raw: acc + '(' }, false));

        const importPath = relativePathToImportLike(path, fileContext, pathname);
        const importName = addAssetImport(importPath);

        expressions.push(importName);

        acc = `${hash ? `#${hash}` : ''})`;
        i++;
      }
    }
  }

  quasis.push(astService.templateElement({ raw: acc }, true));

  return astService.templateLiteral(quasis, expressions);
}
