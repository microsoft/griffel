import '@testing-library/jest-dom';

// Make jest globals available for compatibility with existing tests
// @ts-ignore
globalThis.jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

// Make chrome global available for devtools tests
// @ts-ignore
globalThis.chrome = {
  runtime: {
    getManifest: () => ({ manifest_version: 2 }),
  },
};
