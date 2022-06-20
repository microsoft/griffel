import { parseStackTraceLine } from './react-render-tracker/stackTrace';

export function getSourceURLfromError() {
  const stacks = String(new Error().stack).split('\n');
  const userMakeStyleCallLine = findUserMakeStyleCallInStacks(stacks);
  if (userMakeStyleCallLine === undefined) {
    return undefined;
  }

  const result = parseStackTraceLine(userMakeStyleCallLine);
  return result?.loc as string | undefined;
}

function findUserMakeStyleCallInStacks(stacks: string[]) {
  for (let i = stacks.length - 1; i >= 0; --i) {
    if (stacks[i].includes('at getSourceURLfromError')) {
      // The error stacks look like:
      //   getSourceURLfromError
      //   makeStyles/__styles in griffel core
      //   makeStyles/__styles in griffel react
      //   user makeStyles call
      return stacks[i + 3];
    }
  }
  return undefined;
}
