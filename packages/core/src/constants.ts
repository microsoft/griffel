import * as CSS from 'csstype';
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
export const UNSUPPORTED_CSS_PROPERTIES: Record<keyof CSS.StandardShorthandProperties, number> = {
  all: 1,
  animation: 1,
  background: 1,
  backgroundPosition: 1,
  border: 1,
  borderBlock: 1,
  borderBlockEnd: 1,
  borderBlockStart: 1,
  borderBottom: 1,
  borderColor: 1,
  borderImage: 1,
  borderInline: 1,
  borderInlineEnd: 1,
  borderInlineStart: 1,
  borderLeft: 1,
  borderRadius: 1,
  borderRight: 1,
  borderStyle: 1,
  borderTop: 1,
  borderWidth: 1,
  columns: 1,
  columnRule: 1,
  flex: 1,
  flexFlow: 1,
  font: 1,
  gap: 1,
  grid: 1,
  gridArea: 1,
  gridColumn: 1,
  gridRow: 1,
  gridTemplate: 1,
  lineClamp: 1,
  listStyle: 1,
  margin: 1,
  mask: 1,
  maskBorder: 1,
  motion: 1,
  offset: 1,
  outline: 1,
  overflow: 1,
  overscrollBehavior: 1,
  padding: 1,
  placeItems: 1,
  placeSelf: 1,
  textDecoration: 1,
  textEmphasis: 1,
  transition: 1,
} as const;
