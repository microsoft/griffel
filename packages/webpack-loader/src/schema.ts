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
