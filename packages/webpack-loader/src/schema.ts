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
  },
};
