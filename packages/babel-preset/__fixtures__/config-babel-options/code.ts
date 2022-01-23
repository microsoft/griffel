import { makeStyles } from '@griffel/react';

const func = () => {
  // This assignment has no sense, but it will prevent us from evaluation in AST
  // This fixture uses "colorRenamePlugin.js" in transformPlugin's config so input we should get a different color
  const color = 'red';

  return { color };
};

export const useStyles = makeStyles({
  root: func(),
});
