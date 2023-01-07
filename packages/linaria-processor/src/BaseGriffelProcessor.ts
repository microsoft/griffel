import type { Expression } from '@babel/types';
import type { Params, TailProcessorParams } from '@linaria/tags';
import { BaseProcessor, TaggedTemplateProcessor, validateParams } from '@linaria/tags';
import * as path from 'path';

export default abstract class BaseGriffelProcessor extends BaseProcessor {
  readonly expressionName: string | number | boolean | null = null;

  public constructor([tag, callParam]: Params, ...args: TailProcessorParams) {
    super([tag], ...args);

    validateParams([tag, callParam], ['callee', 'call'], TaggedTemplateProcessor.SKIP);

    if (callParam[0] === 'call') {
      const { ex } = callParam[1];

      if (ex.type === 'Identifier') {
        this.dependencies.push(callParam[1] as any);
        this.expressionName = ex.name;
      } else if (ex.type === 'NullLiteral') {
        this.expressionName = null;
      } else {
        this.expressionName = ex.value;
      }
    }
  }

  public get path() {
    return process.platform === 'win32' ? path.win32 : path.posix;
  }

  public override get asSelector(): string {
    throw new Error('The result of makeStyles cannot be used as a selector.');
  }

  public override doEvaltimeReplacement(): void {
    this.replacer(this.value, false);
  }

  public override get value(): Expression {
    return this.astService.nullLiteral();
  }

  public override toString(): string {
    return `${super.toString()}(…)`;
  }
}
