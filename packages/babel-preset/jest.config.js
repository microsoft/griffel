module.exports = {
  displayName: 'babel-preset',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^sampleEvaluator$': '<rootDir>/__fixtures__/config-evaluation-rules/sampleEvaluator.js',
  },
  coverageDirectory: '../../coverage/packages/babel-preset',
};
