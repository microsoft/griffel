import { __styles } from '@griffel/react';

export const styles = __styles(
  {
    root: {
      Bi91k9c: 'faf35ka',
    },
  },
  {
    d: ['.fcnqdeg{background-color:green;}'],
  },
);

export async function loadStyles() {
  const stylesA = await import(/* webpackChunkName: "chunkA" */ './chunkA');
  const stylesB = await import(/* webpackChunkName: "chunkB" */ './chunkB');

  return [stylesA, stylesB];
}
