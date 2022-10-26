import { __styles } from '@griffel/react';

export const styles = __styles(
  {},
  // Classes in this test are intentionally not realistic to simplify snapshots
  {
    d: ['.color-red { color: red; }', '.animation-name { animation-name: foo; }'],
    l: ['.color-orange:link { color: orange; }'],
    v: ['.color-purple:visited { color: purple; }'],
    w: ['.color-pink:focus-within { color: pink; }'],
    f: ['.color-blue:focus { color: blue; }'],
    i: ['.color-light-blue:focus-visible { color: salmon; }'],
    h: ['.color-yellow:hover { color: yellow; }'],
    a: ['.color-black:active { color: black; }'],
    k: ['@keyframes foo { from{ transform:rotate(0deg); } to { transform:rotate(360deg); } }'],
    t: ['@supports (display: table-cell){.foo{color:red;}}', '@layer color {.f1hjcal7 {color: red;}}'],
    m: [
      [
        '@media (forced-colors: active) { .color-magenta { color: magenta; } }',
        {
          m: '(forced-colors: active)',
        },
      ],
    ],
  },
);
