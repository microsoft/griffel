import { createStylesA } from 'custom-package';
import { __styles } from 'custom-package';
import { createStylesB } from 'another-custom-package';
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
