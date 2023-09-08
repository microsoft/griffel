import { runAsWorker } from 'synckit';
import * as stylelint from 'stylelint';
import { StylelintSyncReturn } from './types';

runAsWorker(async (css: string, configFile: string): Promise<StylelintSyncReturn> => {
  try {
    const { results } = await stylelint.lint({ code: css, configFile });
    const warnings = results.map(r => r.warnings);
    return { stylelintErrors: warnings.flat() };
  } catch (e) {
    let error = 'Error running stylelint, please report to Griffel maintainers';
    if (e instanceof Error) {
      error = `${error}: ${e.message}`;
    }

    return {
      error,
      stylelintErrors: [],
    };
  }
});
