import { GriffelRenderer } from '../types';

/**
 * Lazily adds a `<style>` bucket to the `<head>` for a media query.
 * Uses the comparator configured in the Griffel renderer to keep consistent media
 * query order.
 */
export function getStyleSheetForMedia(
  mediaQuery: string,
  target: Document,
  renderer: GriffelRenderer,
  elementAttributes: Record<string, string> = {},
): CSSStyleSheet {
  if (!renderer.mediaElements[mediaQuery]) {
    const tag = target.createElement('style');
    tag.dataset['makeStylesMedia'] = mediaQuery;
    for (const attribute in elementAttributes) {
      tag.setAttribute(attribute, elementAttributes[attribute]);
    }
    renderer.mediaElements[mediaQuery] = tag;

    const mediaElements = target.head.querySelectorAll('[data-make-styles-media]') as NodeListOf<HTMLStyleElement>;
    let i = 0;
    for (
      ;
      i < mediaElements.length &&
      renderer.compareMediaQuery(mediaQuery, mediaElements[i].dataset['makeStylesMedia']!) > 0;
      i++ // eslint-disable-next-line no-empty
    ) {}

    const nextBucket = mediaElements[i];
    if (nextBucket) {
      target.head.insertBefore(tag, nextBucket);
    } else {
      target.head.appendChild(tag);
    }
  }

  return renderer.mediaElements[mediaQuery]!.sheet as CSSStyleSheet;
}
