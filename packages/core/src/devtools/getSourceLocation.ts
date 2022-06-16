import ErrorStackParser from 'error-stack-parser';

export function getSourceLocation(isRuntimeTransforms = false) {
  const error = new Error();

  const stacks = ErrorStackParser.parse(error);
  const userMakeStyleCall = findUserMakeStyleCallInStacks(stacks, isRuntimeTransforms);

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

function findUserMakeStyleCallInStacks(stacks: ErrorStackParser.StackFrame[], isRuntimeTransforms = false) {
  for (let i = stacks.length - 1; i >= 0; --i) {
    if (isRuntimeTransforms) {
      if (stacks[i].functionName === 'makeStyles') {
        // error call stacks:
        // - getSourceLocation
        // - makeStyles in griffel core
        // - makeStyles in griffel react
        // - user makeStyles call
        return stacks[i + 1];
      }
    } else if (stacks[i].functionName === '__styles') {
      // error call stacks:
      // - getSourceLocation
      // - __styles in griffel core
      // - __styles in griffel react
      // - eval
      // - user makeStyles call
      return stacks[i + 2];
    }
  }
  return undefined;
}
