import { debugData, isDevToolsEnabled, getSourceURLfromError } from './devtools';
import { insertionFactory } from './insertionFactory';
import { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots';
import { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
import type { CSSClassesMapBySlot, CSSRulesByBucket, GriffelRenderer, StylesBySlots } from './types';
import type { GriffelInsertionFactory } from './types';

export interface MakeStylesOptions {
  dir: 'ltr' | 'rtl';
  renderer: GriffelRenderer;
}

export function makeStyles<Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
  factory: GriffelInsertionFactory = insertionFactory,
) {
  const insertStyles = factory();

  let classesMapBySlot: CSSClassesMapBySlot<Slots> | null = null;
  let cssRules: CSSRulesByBucket | null = null;

  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  let sourceURL: string | undefined;
  if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
    sourceURL = getSourceURLfromError();
  }

  let classNameHashSalt: string;

  function computeClasses(options: MakeStylesOptions): Record<Slots, string> {
    const { dir, renderer } = options;

    if (classesMapBySlot === null) {
      [classesMapBySlot, cssRules] = resolveStyleRulesForSlots(stylesBySlots, renderer.classNameHashSalt);

      if (process.env.NODE_ENV !== 'production') {
        if (renderer.classNameHashSalt) {
          if (classNameHashSalt !== renderer.classNameHashSalt) {
            console.error(
              [
                '@griffel/core:',
                '\n\n',
                'A provided renderer has different "classNameHashSalt".',
                'This is not supported and WILL cause issues with classnames generation.',
                'Ensure that all renderers created with "createDOMRenderer()" have the same "classNameHashSalt".',
              ].join(' '),
            );
          }

          classNameHashSalt = renderer.classNameHashSalt;
        }
      }
    }

    const isLTR = dir === 'ltr';

    if (isLTR) {
      if (ltrClassNamesForSlots === null) {
        ltrClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);
      }
    } else {
      if (rtlClassNamesForSlots === null) {
        rtlClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);
      }
    }

    insertStyles(renderer, cssRules!);

    const classNamesForSlots = isLTR
      ? (ltrClassNamesForSlots as Record<Slots, string>)
      : (rtlClassNamesForSlots as Record<Slots, string>);

    if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
      debugData.addSequenceDetails(classNamesForSlots!, sourceURL);
    }

    return classNamesForSlots;
  }

  return computeClasses;
}
