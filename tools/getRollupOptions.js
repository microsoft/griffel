function getRollupOptions(/** @type {import('rollup').RollupOptions} */ options) {
  if (Array.isArray(options.output)) {
    options.output = options.output.map(output => ({
      ...output,
      // Stops bundling to a single file and prevents bundle size issues
      preserveModules: true,
      preserveModulesRoot: 'src',
      // Add interop for CJS
      ...(output.format === 'cjs' && { interop: 'compat' }),
    }));

    return options;
  }

  throw new Error('"options.output" should be an array');
}

module.exports = getRollupOptions;
