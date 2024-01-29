import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isLiteral, isTemplateLiteral } from './helpers';

export function getShorthandValue(node: TSESTree.Node | null | undefined, sourceCode: Readonly<TSESLint.SourceCode>) {
  if (isLiteral(node)) {
    switch (typeof node.value) {
      case 'string':
      case 'number':
        return {
          quote: "'",
          value: node.value,
        } as const;
    }
  } else if (isTemplateLiteral(node)) {
    const value = sourceCode.getText(node);
    return {
      quote: '`',
      value: value.slice(1, -1),
    } as const;
  }

  return undefined;
}

export function joinShorthandArguments(args: readonly string[], quote: `'` | `"` | '`'): string {
  return args.map(arg => quote + arg + quote).join(', ');
}
