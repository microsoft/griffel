import { __styles } from '@griffel/react';

export const styles = __styles(
  {
    root: {
      Bi91k9c: 'faf35ka',
    },
  },
  {
    m: [
      ['@media(min-width: 1px) {.fcnqdeg{background-color:green;}}', { m: '(min-width: 1px)' }],
      ['@media(min-width: 2px) { .fe3e8s9{color:olive;} }', { m: '(min-width: 2px)' }],
    ],
  },
);

export async function loadStyles() {
  const stylesA = await import(/* webpackChunkName: "chunkA" */ './chunkA');
  const stylesB = await import(/* webpackChunkName: "chunkB" */ './chunkB');

  return [stylesA, stylesB];
}
