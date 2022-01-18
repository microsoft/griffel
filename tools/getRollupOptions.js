function getRollupOptions(/** @type {import('rollup').RollupOptions} */ options) {
  if (Array.isArray(options.output)) {
    options.output.forEach(o => {
      o.preserveModules = true;
      o.preserveModulesRoot = 'src';
      o.interop = false;
    });
  } else {
    options.output = {
      ...options.output,
      preserveModules: true,
      preserveModulesRoot: 'src',
      interop: false,
    };
  }

  return options;
}

module.exports = getRollupOptions;
