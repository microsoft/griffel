import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'green',
  },
});

export async function loadStyles() {
  const { styles: stylesA } = await import('./chunkA');
  const { styles: stylesB } = await import('./chunkB');

  return [stylesA, stylesB];
}
