import type { JSONSchema7 } from 'json-schema';

export const optionsSchema: JSONSchema7 = {
  properties: {
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
};
