'use client';

import { makeStaticStyles as vanillaMakeStaticStyles } from '@griffel/core';
import type { GriffelStaticStyles, MakeStaticStylesOptions } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useRenderer } from './RendererContext';

export function makeStaticStyles(styles: GriffelStaticStyles | GriffelStaticStyles[]) {
  const getStyles = vanillaMakeStaticStyles(styles, insertionFactory);

  if (process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  return function useStaticStyles(): void {
    const renderer = useRenderer();
    const options: MakeStaticStylesOptions = { renderer };

    return getStyles(options);
  };
}
