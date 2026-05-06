export default {
  displayName: 'webpack-extraction-plugin',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // babel-plugin-tester v12 bundles prettier v3 (ESM-only via dynamic import) which is
    // incompatible with Jest's CommonJS runtime. Remap it to the root prettier (v2, sync CJS).
    '^prettier$': '<rootDir>/../../node_modules/prettier/index.js',
  },
  coverageDirectory: '../../coverage/packages/webpack-loader',
};
