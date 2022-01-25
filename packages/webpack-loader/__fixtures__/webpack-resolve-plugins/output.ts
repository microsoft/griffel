import { __styles } from '@griffel/react';
import { tokens } from './tokens'; // @ts-expect-error This module will be resolved via aliases

import color from 'non-existing-color-module';

const styles = __styles(
  {
    root: {
      De3pzq: 'f1bh81bl',
      sj55zd: 'fl9q5hc',
    },
  },
  {
    d: ['.f1bh81bl{background-color:blue;}', '.fl9q5hc{color:var(--colorBrandStroke1);}'],
  },
);

console.log(styles);
