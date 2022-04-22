// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStylesA } from 'custom-package'; // @ts-expect-error This module does not exist, but will be resolved via aliases

import { __styles } from 'custom-package'; // @ts-expect-error This module does not exist, but will be resolved via aliases

import { createStylesB } from 'another-custom-package'; // @ts-expect-error This module does not exist, but will be resolved via aliases

import { createStylesC } from 'another-package';
export const useStyles = __styles(
  {
    root: {
      sj55zd: 'fe3e8s9',
    },
  },
  {
    d: ['.fe3e8s9{color:red;}'],
  },
);
export const useClassesA = createStylesA({
  root: {
    color: 'yellow',
  },
});
export const useClassesB = createStylesB({
  root: {
    color: 'blue',
  },
});
export const useClassesC = createStylesC({
  root: {
    color: 'orange',
  },
});
