import { warnAboutUnsupportedFunctionValues } from './warnings/warnAboutUnsupportedFunctionValues';

export function validateArguments(fnName: string, args: IArguments | unknown[]): void {
  if (args.length === 1 && typeof args[0] === 'string') {
    if (
      args[0]
        .split(' ')
        .map(arg => arg.trim())
        .filter(Boolean).length > 1
    ) {
      warnAboutUnsupportedFunctionValues(fnName, args[0]);
    }
  }
}
