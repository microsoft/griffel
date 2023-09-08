import { ASTUtils, TSESTree } from '@typescript-eslint/utils';
import { BabelPluginOptions } from '@griffel/babel-preset';

import { transformSync } from './transform-sync';
import {
  isIdentifier,
  isMakeStylesIdentifier,
  isObjectExpression,
  isProperty,
  isMakeResetStylesIdentifier,
} from '../../utils/helpers';
import { createRule } from '../../utils/createRule';
import { stylelintSync } from './stylelint-sync';

type Options = [BabelPluginOptions & { stylelintConfigFile?: string }];

type MessageIds = 'stylelint';

const lintCSS: (css: string, stylelintConfigFile?: string) => string[] = (css, stylelintConfigFile) => {
  const uniqueErrors: Record<string /** ruleId */, string> = {};
  const { error, stylelintErrors } = stylelintSync(css, stylelintConfigFile);

  if (error) {
    throw new Error(`${error} - this is not expected: please report a bug if it happens`);
  }

  // Since we can only map errors to the entire style slot, we should report unique errors
  for (const error of stylelintErrors) {
    uniqueErrors[error.rule] = error.text;
  }

  return Object.values(uniqueErrors);
};

// TODO createRule does not generate docs url properly for sub-directory
export const cssLintRule = createRule<Options, MessageIds>({
  name: 'css-lint',
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          stylelintConfigFile: {
            type: 'string',
            description:
              'Path to a .stylelintrc config file. By default, stylelint will try to find a config file in a parent directory',
          },
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
      stylelint: 'stylelint: {{stylelint}}',
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
    const { stylelintConfigFile, ...pluginOptions } = context.options[0];

    return {
      'Program:exit'(node) {
        if (!context.getPhysicalFilename) {
          throw new Error(
            'No physical filename could be found - this is not expected: please report this to Griffel authors',
          );
        }

        const filename = context.getPhysicalFilename();
        const source = context.getSourceCode().getText();
        const { metadata } = transformSync(source, {
          filename,
          pluginOptions: {
            ...pluginOptions,
            // This rule cannot do anything without metadata - always generate them
            generateMetadata: true,
          },
        });

        const { cssEntries, cssResetEntries } = metadata;

        for (const [declaratorId, cssRulesBySlot] of Object.entries(cssEntries)) {
          for (const [slotName, rules] of Object.entries(cssRulesBySlot)) {
            const errors = lintCSS(rules.join(''), stylelintConfigFile);

            const property = slotPropertiesByDeclaratorId.get(declaratorId)?.get(slotName);
            for (const error of errors) {
              context.report({ messageId: 'stylelint', node: property ?? node, data: { stylelint: error } });
            }
          }
        }

        for (const [resetDeclarator, [resetCSS]] of Object.entries(cssResetEntries)) {
          const errors = lintCSS(resetCSS, stylelintConfigFile);
          const property = resetEntriesByDeclaratorId.get(resetDeclarator);
          for (const error of Object.values(errors)) {
            context.report({ messageId: 'stylelint', node: property ?? node, data: { stylelint: error } });
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
