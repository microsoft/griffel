import { GriffelCSSExtractionPlugin } from '@griffel/webpack-extraction-plugin';
import * as browserslist from 'browserslist';
import { lazyPostCSS } from 'next/dist/build/webpack/config/blocks/css';
import { getGlobalCssLoader } from 'next/dist/build/webpack/config/blocks/css/loaders';

import type { GriffelCSSExtractionPluginOptions } from '@griffel/webpack-extraction-plugin';
import type { NextConfig } from 'next';
import type { ConfigurationContext } from 'next/dist/build/webpack/config/utils';
import type { Configuration, RuleSetRule } from 'webpack';

type GriffelNextExtractionPluginOptions = GriffelCSSExtractionPluginOptions & {
  extractLoaderRuleAttrs?: Omit<RuleSetRule, 'test' | 'use'>;
};

function getSupportedBrowsers(dir: string, isDevelopment: boolean) {
  let browsers: string[] | undefined;
  try {
    browsers = browserslist.loadConfig({
      path: dir,
      env: isDevelopment ? 'development' : 'production',
    });
  } catch {
    // Prevent error on build time
  }

  return browsers;
}

export const withGriffelCSSExtraction =
  ({
    extractLoaderRuleAttrs: webpackLoaderRules = {},
    ...webpackPluginOptions
  }: GriffelNextExtractionPluginOptions = {}) =>
  (nextConfig: NextConfig = {}) =>
    Object.assign({}, nextConfig, {
      webpack(config: Configuration & ConfigurationContext, options) {
        const { dir, dev, isServer } = options;

        if (!options.defaultLoaders) {
          throw new Error(
            'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade',
          );
        }

        // The @Griffel compiler must run on source code, which means it must be
        // configured as the last loader in webpack so that it runs before any
        // other transformation.

        if (typeof nextConfig.webpack === 'function') {
          // eslint-disable-next-line no-param-reassign
          config = nextConfig.webpack(config, options);
        }

        if (dev) {
          // not push @griffel/webpack-extraction-plugin if dev build
          return config;
        }

        const cssRules = (
          config.module?.rules?.find(
            rule =>
              typeof rule === 'object' &&
              rule !== null &&
              Array.isArray(rule.oneOf) &&
              rule.oneOf.some(
                setRule =>
                  setRule &&
                  setRule.test instanceof RegExp &&
                  typeof setRule.test.test === 'function' &&
                  setRule.test.test('filename.css'),
              ),
          ) as RuleSetRule
        )?.oneOf;

        if (cssRules) {
          config?.module?.rules?.unshift({
            ...webpackLoaderRules,
            test: /\.(tsx|ts|js|jsx)$/,
            use: [
              {
                loader: GriffelCSSExtractionPlugin.loader,
              },
            ],
          });

          cssRules.unshift({
            test: /griffel\.css$/i,
            sideEffects: true,
            use: getGlobalCssLoader(
              {
                assetPrefix: config.assetPrefix,
                isClient: !isServer,
                isServer,
                isDevelopment: dev,
                experimental: nextConfig.experimental || {},
              } as ConfigurationContext,
              () => lazyPostCSS(dir, getSupportedBrowsers(dir, dev), undefined),
              [],
            ),
          });

          if (!Array.isArray(config?.plugins)) {
            config.plugins = [];
          }

          config.plugins.push(new GriffelCSSExtractionPlugin(webpackPluginOptions));
        }

        return config;
      },
    } as NextConfig);
