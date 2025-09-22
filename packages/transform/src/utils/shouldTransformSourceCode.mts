/**
 * Checks if source code contains makeStyles or makeResetStyles calls that need to be transformed.
 * This is used for early return optimization to avoid expensive parsing when not needed.
 */
export function shouldTransformSourceCode(
  sourceCode: string,
  modules: string[] = ['@griffel/core', '@griffel/react', '@fluentui/react-components'],
): boolean {
  // Basic check for makeStyles or makeResetStyles function calls
  if (sourceCode.indexOf('makeStyles') === -1 && sourceCode.indexOf('makeResetStyles') === -1) {
    return false;
  }

  // Check if it's likely from one of the supported modules by looking for imports
  const hasGriffelImport = modules.some(
    module => sourceCode.includes(`from '${module}'`) || sourceCode.includes(`from "${module}"`),
  );

  // Only process if we have a griffel import, otherwise it might be a local function with the same name
  return hasGriffelImport;
}
