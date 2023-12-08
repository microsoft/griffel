import type { JSONSchema7 } from 'json-schema';

export const configSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/schema',
  $id: 'babel-transformPlugin-options',

  type: 'object',
  properties: {
    generateMetadata: {
      type: 'boolean',
    },
    babelOptions: {
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
      type: 'array',
      items: {
        type: 'object',
        required: ['action'],
        properties: {
          action: {
            anyOf: [{}, { type: 'string' }, { const: 'ignore' }],
          },
          test: {},
        },
      },
    },
  },
  additionalProperties: false,
};
