import type { Warning } from 'stylelint';

export interface StylelintSyncReturn {
  error?: string;
  stylelintErrors: Warning[];
}
