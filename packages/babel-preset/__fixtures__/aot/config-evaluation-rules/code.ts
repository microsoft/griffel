import { makeStyles } from '@griffel/react';
import { colorRed } from './consts';

export const useStyles = makeStyles({
  // This import has no sense, but it will prevent us from evaluation in AST by Babel
  // This fixture uses "sampleEvaluator.js" in transformPlugin's config so input we should get a different color
  root: { color: colorRed },
});
