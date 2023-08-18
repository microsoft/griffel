import { RuntimeModule, Template } from 'webpack';

export class GriffelCSSRuntimeModule extends RuntimeModule {
  constructor(
    private cssRuleToPropertyHashMap: Record<string, string>,
    private ltrToRtlClassMap: Record<string, string>,
  ) {
    super('@griffel/webpack-extraction-plugin lookup caches');
  }

  override generate(): string {
    return Template.asString([
      `var g = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' : window : global;`,
      `g[Symbol.for('@griffel/CLASS_PROP_LOOKUP')] = ${JSON.stringify(this.cssRuleToPropertyHashMap)};`,
      `g[Symbol.for('@griffel/LTR_TO_RTL_LOOKUP')] = ${JSON.stringify(this.ltrToRtlClassMap)};`,
    ]);
  }
}
