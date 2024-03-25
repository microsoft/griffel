import { parse } from './parse';
import { stringify } from './stringify';

export { parse, stringify };
export { createSyntax } from './createSyntax';

export { postProcessor } from './postProcessor';

export default {
  parse,
  stringify,
};

export { GRIFFEL_DECLARATOR_LOCATION_RAW, GRIFFEL_SLOT_LOCATION_RAW } from './constants';
