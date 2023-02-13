function getRollupOptions(/** @type {import('rollup').RollupOptions} */ options) {
  if (Array.isArray(options.output)) {
    throw new Error('"options.output" cannot be an array');
  }

  options.output = {
    ...options.output,
    // Stops bundling to a single file and prevents bundle size issues
    preserveModules: true,
    preserveModulesRoot: 'src',
    // Enables sourcemaps
    sourcemap: true,
  };

  return options;
}

module.exports = getRollupOptions;
