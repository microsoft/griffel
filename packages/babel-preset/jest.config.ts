/* eslint-disable */
export default {
  displayName: 'babel-preset',
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
    '^sampleEvaluator$': '<rootDir>/__fixtures__/config-evaluation-rules/sampleEvaluator.js',
  },
  coverageDirectory: '../../coverage/packages/babel-preset',
};
