import { parse } from './parse.js';
import { stringify } from './stringify.js';

export { parse, stringify };
export { createSyntax } from './createSyntax.js';

export default {
  parse,
  stringify,
};

export { GRIFFEL_DECLARATOR_LOCATION_RAW, GRIFFEL_SLOT_LOCATION_RAW } from './constants.js';
