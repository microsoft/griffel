import ErrorStackParser from 'error-stack-parser';

export function getSourceLocation() {
  const error = new Error();

  const stacks = ErrorStackParser.parse(error);
  const userMakeStyleCall = findUserMakeStyleCallInStacks(stacks);

  if (!userMakeStyleCall) {
    return undefined;
  }

  const { lineNumber, columnNumber, fileName } = userMakeStyleCall;
  if (lineNumber !== undefined && columnNumber !== undefined && fileName !== undefined) {
    return {
      columnNumber,
      lineNumber,
      sourceURL: fileName,
    };
  }

  return undefined;
}

function findUserMakeStyleCallInStacks(stacks: ErrorStackParser.StackFrame[]) {
  for (let i = stacks.length - 1; i >= 0; --i) {
    if (stacks[i].functionName === 'makeStyles') {
      return stacks[i + 1];
    }
  }
  return undefined;
}
