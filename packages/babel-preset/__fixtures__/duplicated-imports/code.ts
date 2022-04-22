// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStylesA } from 'custom-package';
// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStyles } from 'custom-package';
// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStylesB } from 'another-custom-package';
// @ts-expect-error This module does not exist, but will be resolved via aliases
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
