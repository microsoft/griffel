it('hosts global constants', async () => {
  const importA = await import('./constants');

  // We are reloading a module, so instances that are created inside a module will be different
  // https://jestjs.io/docs/jest-object#jestresetmodules
  jest.resetModules();
  const importB = await import('./constants');

  expect(importA.DEFINITION_LOOKUP_TABLE).toBe(importA.DEFINITION_LOOKUP_TABLE);
  expect(importA.DEBUG_RESET_CLASSES).toBe(importA.DEBUG_RESET_CLASSES);

  // This constant is not global, expected to be different
  expect(importA.UNSUPPORTED_CSS_PROPERTIES).not.toBe(importB.UNSUPPORTED_CSS_PROPERTIES);
});
