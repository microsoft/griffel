import { parse } from './parse.mjs';
import { stringify } from './stringify.mjs';

export { parse, stringify };
export { createSyntax } from './createSyntax.mjs';

export default {
  parse,
  stringify,
};

export { GRIFFEL_DECLARATOR_LOCATION_RAW, GRIFFEL_SLOT_LOCATION_RAW } from './constants.mjs';
