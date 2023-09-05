import { createSyncFn } from 'synckit';
import { StylelintSyncReturn } from './types';

export const stylelintSync: (css: string, stylelintConfigFile?: string) => StylelintSyncReturn = createSyncFn(
  require.resolve('./stylelint-task'),
  3000,
);
