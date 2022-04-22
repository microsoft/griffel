import { createStylesA } from 'custom-package';
import { createStyles } from 'custom-package';
import { createStylesB } from 'another-custom-package';
import { createStylesC } from 'another-package';

export const useStyles = createStyles({
  root: { color: 'red' },
});

export const useClassesA = createStylesA({
  root: { color: 'yellow' },
});

export const useClassesB = createStylesB({
  root: { color: 'blue' },
});

export const useClassesC = createStylesC({
  root: { color: 'orange' },
});
