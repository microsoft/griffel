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
    '**/.eslintrc.json',
    '**/jest.config.js',
    '**/project.json',
    '**/README.md',
  ],
  hooks: require('./beachball.hooks'),
};
