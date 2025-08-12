import type { JSONSchema7 } from 'json-schema';

export const configSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/schema',
  $id: 'webpackLoader-options',

  properties: {
    classNameHashSalt: {
      type: 'string',
    },
    classNameHashFilter: {
      type: 'object',
    },
    unstable_keepOriginalCode: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
};
