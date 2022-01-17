function getRollupOptions(/** @type {import('rollup').RollupOptions} */ options) {
  if (Array.isArray(options.output)) {
    options.output.forEach(o => {
      o.preserveModules = true;
      o.preserveModulesRoot = 'src';
    });
  } else {
    options.output = {
      ...options.output,
      preserveModules: true,
      preserveModulesRoot: 'src',
    };
  }

  return options;
}

module.exports = getRollupOptions;
