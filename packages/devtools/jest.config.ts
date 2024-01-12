/* eslint-disable */
export default {
  displayName: 'devtools',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/devtools',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
