// Builds the repro in either "default" mode (current behavior, single griffel.css)
// or "split" mode (the broken multi-chunk emission we are diagnosing).
//
// Usage:
//   node build.mjs            # default mode
//   node build.mjs --split    # split mode (disable plugin's single-chunk forcing)
//
// Outputs to ../../dist/apps/chunking-repro/<mode>/
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import { GriffelPlugin } from '../../dist/packages/webpack-plugin/src/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const split = process.argv.includes('--split');
const outDir = path.resolve(rootDir, 'dist/apps/chunking-repro', split ? 'split' : 'default');

// Plugin that runs AFTER GriffelPlugin and removes its forced 'griffel'
// SplitChunks cache group, so griffel CSS modules fall into each chunk
// naturally - exposing the cross-chunk cascade ordering bug.
class DisableGriffelChunkMergePlugin {
  apply(compiler) {
    const sc = compiler.options.optimization.splitChunks;
    if (sc && sc.cacheGroups && sc.cacheGroups.griffel) {
      delete sc.cacheGroups.griffel;
    }
  }
}

const distWebpackPlugin = path.resolve(rootDir, 'dist/packages/webpack-plugin');

const config = {
  context: __dirname,
  mode: 'production',
  devtool: false,
  entry: {
    'page-a': './src/page-a.tsx',
    'page-b': './src/page-b.tsx',
  },
  output: {
    path: outDir,
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js'],
    alias: {
      // Map @griffel package names to the BUILT dist (root node_modules
      // points to source which has only .ts/.mts files).
      '@griffel/webpack-plugin$': path.join(distWebpackPlugin, 'src/index.mjs'),
      '@griffel/react$': path.resolve(rootDir, 'dist/packages/react/src/index.js'),
      '@griffel/core$': path.resolve(rootDir, 'dist/packages/core/src/index.js'),
      '@griffel/style-types$': path.resolve(rootDir, 'dist/packages/style-types/src/index.js'),
    },
  },
  resolveLoader: {
    alias: {
      '@griffel/webpack-plugin/loader': path.join(distWebpackPlugin, 'src/webpackLoader.mjs'),
    },
  },
  module: {
    rules: [
      // Babel transforms TS/JSX everywhere we care about (app src + @griffel react JSX).
      {
        test: /\.(tsx|ts|jsx)$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          { loader: 'babel-loader', options: { configFile: path.resolve(__dirname, 'babel.config.cjs') } },
          { loader: '@griffel/webpack-plugin/loader' },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  optimization: {
    minimize: false,
    // Default behavior: vendors group + 'all' chunk so shared modules
    // (here: ./styles/shared.ts via 2 entries) hoist into a common chunk.
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        defaultVendors: false,
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].chunk.css',
    }),
    new GriffelPlugin(),
    ...(split ? [new DisableGriffelChunkMergePlugin()] : []),
    new HtmlWebpackPlugin({
      filename: 'page-a.html',
      template: path.resolve(__dirname, 'public/page-a.html'),
      chunks: ['page-a'],
      inject: false,
    }),
    new HtmlWebpackPlugin({
      filename: 'page-b.html',
      template: path.resolve(__dirname, 'public/page-b.html'),
      chunks: ['page-b'],
      inject: false,
    }),
  ],
  performance: { hints: false },
  stats: 'minimal',
};

webpack(config, (err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(stats.toString({ colors: true, chunks: true, chunkModules: false, assets: true }));
  if (stats.hasErrors()) process.exit(1);

  console.log(`\nMode: ${split ? 'SPLIT (broken)' : 'DEFAULT (single griffel.css)'}`);
  console.log(`Output: ${path.relative(rootDir, outDir)}`);

  // List CSS assets
  const cssFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.css'));
  console.log(`\nCSS files emitted:`);
  for (const file of cssFiles) {
    const size = fs.statSync(path.join(outDir, file)).size;
    console.log(`  ${file}  (${size} bytes)`);
  }
});
