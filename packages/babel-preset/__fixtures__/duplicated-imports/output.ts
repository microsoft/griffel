// @ts-expect-error This module does not exist, but will be resolved via aliases
import { __styles } from 'custom-package'; // @ts-expect-error This module does not exist, but will be resolved via aliases

import { createStylesB } from 'custom-package';
export const useClassesA = __styles(
  {
    root: {
      sj55zd: 'fe3e8s9',
    },
  },
  {
    d: ['.fe3e8s9{color:red;}'],
  },
);
export const useClassesB = createStylesB({
  root: {
    color: 'yellow',
  },
});
