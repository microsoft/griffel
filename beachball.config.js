// @ts-check

/**
 * @type {import('beachball').BeachballConfig}
 */
module.exports = {
  gitTags: false,
  ignorePatterns: [
    '**/__fixtures__/**',
    '**/*.test.{ts,tsx}',
    '**/*.stories.tsx',
    '**/eslint.config.mjs',
    '**/project.json',
    '**/README.md',
  ],
  hooks: require('./beachball.hooks'),
};
