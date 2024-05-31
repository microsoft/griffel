import { makeStyles } from '@griffel/react';

export const styles = makeStyles({
  root: {
    backgroundColor: 'green',
  },
});

export async function loadStyles() {
  const { styles: stylesA } = await import(
    /* webpackChunkName: "chunkA" */
    './chunkA'
  );
  const { styles: stylesB } = await import(
    /* webpackChunkName: "chunkB" */
    './chunkB'
  );

  return [stylesA, stylesB];
}
