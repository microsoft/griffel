import { makeStyles } from '@griffel/react';

export const styles = makeStyles({
  root: {
    backgroundColor: 'green',
  },
});

export async function loadStyles() {
  const stylesA = await import('./chunkA');
  const stylesB = await import('./chunkB');

  return [stylesA, stylesB];
}
