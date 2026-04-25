import type { StyleBucketName } from '../types.js';
import type { AtRules } from './utils/types.js';

/**
 * Maps the long pseudo name to the short pseudo name. Pseudos that match here will be ordered, everything else will
 * make their way to default style bucket. We reduce the pseudo name to save bundlesize.
 * Thankfully there aren't any overlaps, see: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes.
 */
const pseudosMap: Record<string, StyleBucketName | undefined> = {
  // :focus-within
  'us-w': 'w',
  // :focus-visible
  'us-v': 'i',

  // :link
  nk: 'l',
  // :visited
  si: 'v',
  // :focus
  cu: 'f',
  // :hover
  ve: 'h',
  // :active
  ti: 'a',
};

export type BucketStrategy = 'leading' | 'extended';

// Regex matches `:link`, `:visited`, `:focus`, `:focus-visible`, `:focus-within`,
// `:hover`, `:active`, irrespective of position. Returned in selector order;
// the caller picks the last match (LVHA: last hit wins).
const LVHA_PSEUDO_RE = /:(?:link|visited|focus-visible|focus-within|focus|hover|active)\b/g;

// Called with bare pseudos (`:hover`) AND with multi-pseudo strings (`:focus:hover`) from the
// leading-strategy path; the slice offsets 3..5 / 4..8 only inspect the leading pseudo characters.
function lookupPseudoBucket(pseudo: string): StyleBucketName | undefined {
  // pseudo is e.g. ':hover' or ':focus-visible'.
  return (
    // 4..8 disambiguates 'focus-visible' / 'focus-within' / 'focus'.
    pseudosMap[pseudo.slice(4, 8)] || pseudosMap[pseudo.slice(3, 5)]
  );
}

/**
 * Gets the bucket depending on the pseudo.
 *
 * Input:
 *
 * ```
 * ":hover"
 * ":focus:hover"
 * ```
 *
 * Output:
 *
 * ```
 * "h"
 * "f"
 * ```
 *
 * @param strategy - `'leading'` (default) classifies by the first pseudo in the selector;
 *   `'extended'` walks the full selector and classifies by the last LVHA pseudo found.
 * @internal
 */
export function getStyleBucketName(
  selectors: string[],
  atRules: AtRules,
  strategy: BucketStrategy = 'leading',
): StyleBucketName {
  if (atRules.media) {
    return 'm';
  }

  // We are grouping all the at-rules like @supports etc. under `t` bucket.
  if (atRules.layer || atRules.supports) {
    return 't';
  }

  if (atRules.container) {
    return 'c';
  }

  if (selectors.length > 0) {
    const normalizedSelector = selectors[0].trim();

    if (strategy === 'extended') {
      // We don't take the leading-pseudo fast path here because selectors like `:focus:hover`
      // start with `:` but the LAST LVHA pseudo determines the bucket. We must walk the whole selector.
      // Extended strategy: walk the full selector for the last LVHA pseudo.
      let lastMatch: RegExpExecArray | null = null;
      let match: RegExpExecArray | null;

      LVHA_PSEUDO_RE.lastIndex = 0;
      while ((match = LVHA_PSEUDO_RE.exec(normalizedSelector)) !== null) {
        lastMatch = match;
      }

      if (lastMatch) {
        return lookupPseudoBucket(lastMatch[0]) || 'd';
      }
    } else if (normalizedSelector.charCodeAt(0) === 58 /* ":" */) {
      // Leading-pseudo classification (default behavior).
      return lookupPseudoBucket(normalizedSelector) || 'd';
    }
  }

  // Return default bucket
  return 'd';
}
