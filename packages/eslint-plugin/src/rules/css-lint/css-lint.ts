import { ASTUtils, TSESTree } from '@typescript-eslint/utils';
import { transformSync } from './transform-sync';
import { BabelPluginOptions } from '@griffel/babel-preset';

import {
  isIdentifier,
  isMakeStylesIdentifier,
  isObjectExpression,
  isProperty,
  isMakeResetStylesIdentifier,
} from '../../utils/helpers';
import { createRule } from '../../utils/createRule';

type Options = [BabelPluginOptions];

type MessageIds = 'foo';

// TODO createRule does not generate docs url properly for sub-directoryjќ
export default createRule<Options, MessageIds>({
  name: 'css-lint',
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          generateMetadata: {
            type: 'boolean',
          },
          modules: {
            description: 'Configures the import name and source of Griffel',
            type: 'array',
            items: {
              type: 'object',
              required: ['moduleSource', 'importName'],
              properties: {
                moduleSource: {
                  type: 'string',
                },
                importName: {
                  type: 'string',
                },
              },
            },
          },
          babelOptions: {
            description:
              'Configures the Griffel babel preset, see https://github.com/microsoft/griffel/blob/main/packages/babel-preset/README.md',
            type: 'object',
            properties: {
              plugins: {
                type: 'array',
              },
              presets: {
                type: 'array',
              },
            },
          },
          evaluationRules: {
            description:
              'Configures the Griffel babel preset, see https://github.com/microsoft/griffel/blob/main/packages/babel-preset/README.md',
            type: 'array',
            items: {
              type: 'object',
              required: ['action'],
              properties: {},
            },
          },
          projectRoot: {
            type: 'string',
          },
        },
      },
    ],
    messages: {
      foo: 'WIP - not ready yet',
    },
    docs: {
      description: 'WIP - not ready yet',
      recommended: 'error',
    },
  },
  defaultOptions: [{}],
  create(context) {
    // Map of all style slots to the makeStyles return function name
    const slotPropertiesByDeclaratorId = new Map<string, Map<string, TSESTree.Property>>();
    // map of all styles to the return of the makeResetStyles function name
    const resetEntriesByDeclaratorId = new Map<string, TSESTree.CallExpression>();
    const options = context.options[0];

    return {
      'Program:exit'(node) {
        if (!context.getPhysicalFilename) {
          // TODO add something actionable here
          throw new Error('No physical filename could be found');
        }

        const filename = context.getPhysicalFilename();
        const source = context.getSourceCode().getText();
        const { metadata } = transformSync(source, {
          filename,
          pluginOptions: {
            ...options,
            // This rule cannot do anything without metadata - always generate them
            generateMetadata: true,
          },
        });

        const { cssEntries, cssResetEntries } = metadata;

        for (const [declaratorId, cssRulesBySlot] of Object.entries(cssEntries)) {
          for (const [slotName /** rules */] of Object.entries(cssRulesBySlot)) {
            // TODO add actual css linting
            const errors: object[] = [{}];
            if (Object.keys(errors).length) {
              const property = slotPropertiesByDeclaratorId.get(declaratorId)?.get(slotName);
              context.report({ messageId: 'foo', node: property ?? node });
            }
          }
        }

        for (const resetDeclarator in cssResetEntries) {
          const errors: object[] = [{}];
          // TODO add actual css linting
          if (Object.keys(errors).length) {
            const property = resetEntriesByDeclaratorId.get(resetDeclarator);
            context.report({ messageId: 'foo', node: property ?? node });
          }
        }
      },
      CallExpression(node) {
        const variableDeclarator = node.parent;
        if (!ASTUtils.isVariableDeclarator(variableDeclarator)) {
          return;
        }

        let declaratorId = '';
        if (isIdentifier(variableDeclarator.id)) {
          declaratorId = variableDeclarator.id.name;
        }

        if (isMakeResetStylesIdentifier(node.callee)) {
          resetEntriesByDeclaratorId.set(declaratorId, node);
        }

        if (isMakeStylesIdentifier(node.callee)) {
          const slotProperties = new Map<string, TSESTree.Property>();
          const slots = node.arguments[0];
          if (isObjectExpression(slots)) {
            slots.properties.forEach(slot => {
              if (
                isProperty(slot) &&
                isIdentifier(slot.key) &&
                (isObjectExpression(slot.value) || isIdentifier(slot.value))
              ) {
                slotProperties.set(slot.key.name, slot);
              }
            });
          }

          slotPropertiesByDeclaratorId.set(declaratorId, slotProperties);
        }
      },
    };
  },
});
