// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStylesA } from 'custom-package';
// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStylesB } from 'custom-package';

export const useClassesA = createStylesA({
  root: { color: 'red' },
});

export const useClassesB = createStylesB({
  root: { color: 'yellow' },
});
