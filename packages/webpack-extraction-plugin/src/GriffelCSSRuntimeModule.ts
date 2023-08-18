import { RuntimeGlobals, RuntimeModule, Template } from 'webpack';

export class GriffelCSSRuntimeModule extends RuntimeModule {
  constructor(
    private cssRuleToPropertyHashMap: Record<string, string>,
    private ltrToRtlClassMap: Record<string, string>,
  ) {
    super('@griffel/webpack-extraction-plugin lookup caches');
  }

  override generate(): string {
    return Template.asString([
      `${RuntimeGlobals.global}[Symbol.for('@griffel/CLASS_PROP_LOOKUP')] = ${JSON.stringify(
        this.cssRuleToPropertyHashMap,
      )};`,
      `${RuntimeGlobals.global}[Symbol.for('@griffel/LTR_TO_RTL_LOOKUP')] = ${JSON.stringify(this.ltrToRtlClassMap)};`,
    ]);
  }
}
