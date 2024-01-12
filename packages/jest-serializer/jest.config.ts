/* eslint-disable */
export default {
  displayName: 'jest-serializer',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/jest-serializer',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
