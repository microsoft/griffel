import { withGriffelCSSExtraction } from './next-extraction-plugin';

import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import type { Configuration, RuleSetRule } from 'webpack';

const getNextConfig: () => NextConfig = () => ({
  webpack: config => {
    return config;
  },
});

const getWebpackConfig: () => Configuration = () => ({
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /.css/,
          },
        ],
      },
    ],
  },
  plugins: [],
});

const options = {
  defaultLoaders: {},
  dev: false,
  dir: '/',
  isServer: true,
  buildId: 'griffel',
} as WebpackConfigContext;

describe('nextExtractionPlugin', () => {
  it('should work', () => {
    const config = withGriffelCSSExtraction({})({});

    expect(config).toBeInstanceOf(Object);
    expect(config.webpack).toBeInstanceOf(Function);
  });

  it('should failed with next@5 and lower', () => {
    const config = withGriffelCSSExtraction({})({});

    if (config?.webpack) {
      const result = () => config.webpack?.({}, {} as WebpackConfigContext);
      expect(result).toThrow(Error);
    }
  });

  it('should call custom webpack config', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const nextConfig = getNextConfig();
    const consoleSpy = jest.spyOn(nextConfig, 'webpack');

    const config = withGriffelCSSExtraction({})(nextConfig);

    if (config?.webpack) config?.webpack({}, options);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should extract css when mode is prod', () => {
    const nextConfig = getNextConfig();
    const webpackConfig = getWebpackConfig();

    const config = withGriffelCSSExtraction({})(nextConfig);

    expect(webpackConfig.plugins?.length).toEqual(0);
    expect(webpackConfig.module?.rules?.length).toEqual(1);
    expect((webpackConfig.module?.rules?.[0] as RuleSetRule)?.oneOf?.length).toEqual(1);

    config.webpack?.(webpackConfig, { ...options });

    expect(webpackConfig.plugins?.length).toEqual(1);
    expect(webpackConfig.module?.rules?.length).toEqual(2);
    expect((webpackConfig.module?.rules?.[1] as RuleSetRule)?.oneOf?.length).toEqual(2);
  });

  it('should extend webpack loader rule', () => {
    const nextConfig = getNextConfig();
    const webpackConfig = getWebpackConfig();

    // @ts-expect-error - pass 'test' param isn't legal
    const config = withGriffelCSSExtraction({ extractLoaderRuleAttrs: { test: /\.(jsx)$/, exclude: /node_modules/ } })(
      nextConfig,
    );

    config.webpack?.(webpackConfig, { ...options });

    const rule = webpackConfig.module?.rules?.[0] as RuleSetRule;

    expect(rule?.exclude).toEqual(/node_modules/);
    expect(rule?.test).toEqual(/\.(tsx|ts|js|jsx)$/);
    expect(rule?.use).toHaveLength(1);
  });

  it("should't extract css when mode is dev", () => {
    const nextConfig = getNextConfig();
    const webpackConfig = getWebpackConfig();

    const config = withGriffelCSSExtraction({})(nextConfig);

    config.webpack?.(webpackConfig, { ...options, dev: true });

    expect(webpackConfig.plugins?.length).toEqual(0);
    expect(webpackConfig.module?.rules?.length).toEqual(1);
    expect((webpackConfig.module?.rules?.[0] as RuleSetRule)?.oneOf?.length).toEqual(1);
  });

  it("should't extract css if native css loader isn't exist", () => {
    const nextConfig = getNextConfig();
    const webpackConfig = getWebpackConfig();

    webpackConfig.module!.rules!.length = 0;

    const config = withGriffelCSSExtraction({})(nextConfig);

    config.webpack?.(webpackConfig, { ...options, dev: true });

    expect(webpackConfig.plugins?.length).toEqual(0);
    expect(webpackConfig.module?.rules?.length).toEqual(0);
  });
});
