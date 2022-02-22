import { LookupItem, SequenceHash } from './types';

/** @internal */
export const HASH_PREFIX = 'f';

/** @internal */
export const SEQUENCE_HASH_LENGTH = 7;

/** @internal */
export const SEQUENCE_PREFIX = '___';

/** @internal */
export const DEFINITION_LOOKUP_TABLE: Record<SequenceHash, LookupItem> = {};

// indexes for values in LookupItem tuple

/** @internal */
export const LOOKUP_DEFINITIONS_INDEX = 0;

/** @internal */
export const LOOKUP_DIR_INDEX = 1;

/** @internal */
export const UNSUPPORTED_CSS_PROPERTIES = {
  animation: true,
  background: true,
  border: true,
  borderBlock: true,
  borderBlockEnd: true,
  borderBlockStart: true,
  borderBottom: true,
  borderColor: true,
  borderImage: true,
  borderInline: true,
  borderInlineEnd: true,
  borderInlineStart: true,
  borderLeft: true,
  borderRadius: true,
  borderRight: true,
  borderStyle: true,
  borderTop: true,
  borderWidth: true,
  columnRule: true,
  flex: true,
  flexFlow: true,
  font: true,
  gap: true,
  grid: true,
  gridArea: true,
  gridColumn: true,
  gridGap: true,
  gridRow: true,
  gridTemplate: true,
  listStyle: true,
  margin: true,
  mask: true,
  maskBorder: true,
  offset: true,
  outline: true,
  overflow: true,
  padding: true,
  placeItems: true,
  placeSelf: true,
  textDecoration: true,
  textEmphasis: true,
  transition: true,
} as const;
