import type { GriffelStylesUnsupportedCSSProperties } from '@griffel/style-types';
import type { LookupItem, SequenceHash } from './types';

// ----

// Heads up!
// These constants are global and will be shared between Griffel instances.
// Any change in them should happen only in a MAJOR version. If it happens,
// please change "__NAMESPACE_PREFIX__" to include a version.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const __GLOBAL__: any = typeof window === 'undefined' ? global : window;
const __NAMESPACE_PREFIX__ = '@griffel/';

function getGlobalVar<T>(name: string, defaultValue: T): T {
  if (!__GLOBAL__[Symbol.for(__NAMESPACE_PREFIX__ + name)]) {
    __GLOBAL__[Symbol.for(__NAMESPACE_PREFIX__ + name)] = defaultValue;
  }

  return __GLOBAL__[Symbol.for(__NAMESPACE_PREFIX__ + name)];
}

/** @internal */
export const DEBUG_RESET_CLASSES = getGlobalVar<Record<string, 1>>('DEBUG_RESET_CLASSES', {});

/** @internal */
export const DEFINITION_LOOKUP_TABLE = getGlobalVar<Record<SequenceHash, LookupItem>>('DEFINITION_LOOKUP_TABLE', {});

// ----

/** @internal */
export const DATA_BUCKET_ATTR = 'data-make-styles-bucket';

/** @internal */
export const DATA_PRIORITY_ATTR = 'data-priority';

/** @internal */
export const HASH_PREFIX = 'f';

/** @internal */
export const RESET_HASH_PREFIX = 'r';

/** @internal */
export const SEQUENCE_HASH_LENGTH = 7;

/** @internal */
export const SEQUENCE_PREFIX = '___';

/** @internal */
export const DEBUG_SEQUENCE_SEPARATOR = '_';

/** @internal */
export const SEQUENCE_SIZE =
  process.env.NODE_ENV === 'production'
    ? SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH
    : SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH + DEBUG_SEQUENCE_SEPARATOR.length + SEQUENCE_HASH_LENGTH;

// indexes for values in LookupItem tuple

/** @internal */
export const LOOKUP_DEFINITIONS_INDEX = 0;

/** @internal */
export const LOOKUP_DIR_INDEX = 1;

// This collection is a map simply for faster access when checking if a CSS property is unsupported
/** @internal */
export const UNSUPPORTED_CSS_PROPERTIES: Record<keyof GriffelStylesUnsupportedCSSProperties, 1> = {
  all: 1,
  borderColor: 1,
  borderStyle: 1,
  borderWidth: 1,

  borderBlock: 1,
  borderBlockEnd: 1,
  borderBlockStart: 1,
  borderInline: 1,
  borderInlineEnd: 1,
  borderInlineStart: 1,
} as const;

/**
 * Removes a CSS property from the style object.
 *
 * @link https://griffel.js.org/react/api/make-styles
 *
 * Do not use the value directly, use `RESET` constant instead.
 */
export const RESET = 'DO_NOT_USE_DIRECTLY: @griffel/reset-value' as unknown as 'unset';
