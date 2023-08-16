import type { JSONSchema7 } from 'json-schema';
import { configSchema } from '@griffel/babel-preset';

export const optionsSchema: JSONSchema7 = {
  ...configSchema,
  properties: {
    ...configSchema.properties,
    inheritResolveOptions: {
      type: 'array',
      items: { type: 'string', enum: ['alias', 'modules', 'plugins', 'conditionNames', 'extensions'] },
    },
    webpackResolveOptions: {
      type: 'object',
      properties: {
        alias: {
          oneOf: [
            {
              type: 'object',
              properties: {
                alias: { oneOf: [{ type: 'string' }, { enum: [false] }, { type: 'array', items: { type: 'string' } }] },
                name: { type: 'string' },
                onlyModule: { type: 'boolean' },
              },
              required: ['alias', 'name'],
            },
            {
              type: 'object',
              patternProperties: {
                ['.*']: {
                  oneOf: [{ type: 'string' }, { enum: [false] }, { type: 'array', items: { type: 'string' } }],
                },
              },
            },
          ],
        },
        conditionNames: { type: 'array', items: { type: 'string' } },
        extensions: { type: 'array', items: { type: 'string' } },
        modules: { type: 'array', items: { type: 'string' } },
        plugins: {
          oneOf: [
            { type: 'string', enum: ['...'] },
            { type: 'object', additionalProperties: true },
          ],
        },
      },
    },
  },
};
