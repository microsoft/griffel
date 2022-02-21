function getRollupOptions(/** @type {import('rollup').RollupOptions} */ options) {
  // Following options are overridden:
  // - `preserveModules` & `preserveModulesRoot` to stop bundling to a single file and prevent bundle size issues
  // - `sourcemap` to enable sourcemaps

  if (Array.isArray(options.output)) {
    options.output.forEach(o => {
      o.preserveModules = true;
      o.preserveModulesRoot = 'src';
      o.sourcemap = true;
    });
  } else {
    options.output = {
      ...options.output,
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
    };
  }

  return options;
}

module.exports = getRollupOptions;
