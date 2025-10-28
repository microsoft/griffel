const { preserveDirectives } = require('rollup-plugin-preserve-directives');

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
  }

  // Add plugin to preserve 'use client' directives in the output files
  options.plugins = options.plugins || [];
  options.plugins.push(preserveDirectives());

  return options;
}

module.exports = getRollupOptions;
