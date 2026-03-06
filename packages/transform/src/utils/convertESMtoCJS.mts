import { parseSync } from 'oxc-parser';
import type { Node } from 'oxc-parser';
import MagicString from 'magic-string';

// Helper to access AST node properties without violating noPropertyAccessFromIndexSignature
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prop = (node: Node, key: string): any => (node as unknown as Record<string, unknown>)[key];

/**
 * Extracts all declared binding names from a pattern node (Identifier, ObjectPattern, ArrayPattern, AssignmentPattern).
 */
function extractDeclaredNames(node: Node): string[] {
  switch (node.type) {
    case 'Identifier':
      return [prop(node, 'name') as string];
    case 'ObjectPattern':
      return (prop(node, 'properties') as Node[]).flatMap(p => {
        if (p.type === 'RestElement') {
          return extractDeclaredNames(prop(p, 'argument') as Node);
        }
        return extractDeclaredNames(prop(p, 'value') as Node);
      });
    case 'ArrayPattern':
      return (prop(node, 'elements') as (Node | null)[]).filter(Boolean).flatMap(el => extractDeclaredNames(el!));
    case 'AssignmentPattern':
      return extractDeclaredNames(prop(node, 'left') as Node);
    default:
      return [];
  }
}

/**
 * Converts ESM import/export syntax to CJS require/exports equivalents.
 * This is needed because the VM evaluator wraps code in `(function(exports) { ... })(exports)`
 * which cannot contain ESM syntax.
 */
export function convertESMtoCJS(code: string, filename: string): string {
  const parseResult = parseSync(filename, code);

  if (parseResult.errors.length > 0) {
    return code;
  }

  const program = parseResult.program;

  let hasESM = false;
  for (const node of program.body) {
    if (
      node.type === 'ImportDeclaration' ||
      node.type === 'ExportNamedDeclaration' ||
      node.type === 'ExportDefaultDeclaration' ||
      node.type === 'ExportAllDeclaration'
    ) {
      hasESM = true;
      break;
    }
  }

  if (!hasESM) {
    return code;
  }

  const ms = new MagicString(code);

  for (const node of program.body) {
    switch (node.type) {
      case 'ImportDeclaration': {
        const source = prop(prop(node, 'source'), 'value') as string;
        const specifiers = prop(node, 'specifiers') as Node[];

        if (specifiers.length === 0) {
          ms.overwrite(node.start, node.end, `require(${JSON.stringify(source)});`);
        } else {
          let defaultName: string | null = null;
          let namespaceName: string | null = null;
          const namedImports: string[] = [];

          for (const spec of specifiers) {
            if (spec.type === 'ImportDefaultSpecifier') {
              defaultName = prop(prop(spec, 'local'), 'name') as string;
            } else if (spec.type === 'ImportNamespaceSpecifier') {
              namespaceName = prop(prop(spec, 'local'), 'name') as string;
            } else if (spec.type === 'ImportSpecifier') {
              const importedNode = prop(spec, 'imported') as Node;
              const imported =
                importedNode.type === 'Identifier'
                  ? (prop(importedNode, 'name') as string)
                  : (prop(importedNode, 'value') as string);
              const local = prop(prop(spec, 'local'), 'name') as string;
              if (imported === local) {
                namedImports.push(imported);
              } else {
                namedImports.push(`${imported}: ${local}`);
              }
            }
          }

          const parts: string[] = [];

          if (namespaceName) {
            parts.push(`const ${namespaceName} = require(${JSON.stringify(source)});`);
          } else if (defaultName && namedImports.length > 0) {
            const tempVar = `_require$${defaultName}`;
            parts.push(`const ${tempVar} = require(${JSON.stringify(source)});`);
            parts.push(`const ${defaultName} = ${tempVar}.__esModule ? ${tempVar}.default : ${tempVar};`);
            parts.push(`const { ${namedImports.join(', ')} } = ${tempVar};`);
          } else if (defaultName) {
            const tempVar = `_require$${defaultName}`;
            parts.push(`const ${tempVar} = require(${JSON.stringify(source)});`);
            parts.push(`const ${defaultName} = ${tempVar}.__esModule ? ${tempVar}.default : ${tempVar};`);
          } else if (namedImports.length > 0) {
            parts.push(`const { ${namedImports.join(', ')} } = require(${JSON.stringify(source)});`);
          }

          ms.overwrite(node.start, node.end, parts.join('\n'));
        }
        break;
      }

      case 'ExportNamedDeclaration': {
        const decl = prop(node, 'declaration') as Node | null;

        if (decl) {
          ms.overwrite(node.start, decl.start, '');

          if (decl.type === 'VariableDeclaration') {
            const names = (prop(decl, 'declarations') as Node[]).flatMap(d =>
              extractDeclaredNames(prop(d, 'id') as Node),
            );
            const exportsCode = names.map(name => `exports.${name} = ${name};`).join(' ');
            ms.appendLeft(node.end, '\n' + exportsCode);
          } else if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') {
            const id = prop(decl, 'id') as Node | null;
            if (id) {
              const name = prop(id, 'name') as string;
              ms.appendLeft(node.end, `\nexports.${name} = ${name};`);
            }
          }
        } else if (prop(node, 'source')) {
          const source = prop(prop(node, 'source'), 'value') as string;
          const parts: string[] = [];
          for (const spec of prop(node, 'specifiers') as Node[]) {
            const localNode = prop(spec, 'local') as Node;
            const exportedNode = prop(spec, 'exported') as Node;
            const local =
              localNode.type === 'Identifier'
                ? (prop(localNode, 'name') as string)
                : (prop(localNode, 'value') as string);
            const exported =
              exportedNode.type === 'Identifier'
                ? (prop(exportedNode, 'name') as string)
                : (prop(exportedNode, 'value') as string);
            parts.push(
              `exports[${JSON.stringify(exported)}] = require(${JSON.stringify(source)})[${JSON.stringify(local)}];`,
            );
          }
          ms.overwrite(node.start, node.end, parts.join('\n'));
        } else {
          const parts: string[] = [];
          for (const spec of prop(node, 'specifiers') as Node[]) {
            const localNode = prop(spec, 'local') as Node;
            const exportedNode = prop(spec, 'exported') as Node;
            const local =
              localNode.type === 'Identifier'
                ? (prop(localNode, 'name') as string)
                : (prop(localNode, 'value') as string);
            const exported =
              exportedNode.type === 'Identifier'
                ? (prop(exportedNode, 'name') as string)
                : (prop(exportedNode, 'value') as string);
            parts.push(`exports[${JSON.stringify(exported)}] = ${local};`);
          }
          ms.overwrite(node.start, node.end, parts.join('\n'));
        }
        break;
      }

      case 'ExportDefaultDeclaration': {
        const decl = prop(node, 'declaration') as Node;
        if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') {
          const id = prop(decl, 'id') as Node | null;
          if (id) {
            ms.overwrite(node.start, decl.start, '');
            ms.appendLeft(node.end, `\nexports.default = ${prop(id, 'name') as string};`);
          } else {
            ms.overwrite(node.start, decl.start, 'exports.default = ');
          }
        } else {
          ms.overwrite(node.start, decl.start, 'exports.default = ');
          if (code[node.end - 1] !== ';') {
            ms.appendLeft(node.end, ';');
          }
        }
        break;
      }

      case 'ExportAllDeclaration': {
        const source = prop(prop(node, 'source'), 'value') as string;
        const exportedNode = prop(node, 'exported') as Node | null;
        if (exportedNode) {
          const name =
            exportedNode.type === 'Identifier'
              ? (prop(exportedNode, 'name') as string)
              : (prop(exportedNode, 'value') as string);
          ms.overwrite(node.start, node.end, `exports[${JSON.stringify(name)}] = require(${JSON.stringify(source)});`);
        } else {
          ms.overwrite(node.start, node.end, `Object.assign(exports, require(${JSON.stringify(source)}));`);
        }
        break;
      }
    }
  }

  // Mark the module as ESM-converted for interop
  ms.prepend('Object.defineProperty(exports, "__esModule", { value: true });\n');

  return ms.toString();
}
