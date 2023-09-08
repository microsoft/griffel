import * as postcss from 'postcss';
import { GRIFFEL_SRC_RAW } from './constants';

export const stringify: postcss.Stringifier = root => {
  const originalSource = root.raw(GRIFFEL_SRC_RAW);
  if (originalSource) {
    return originalSource;
  }

  // TODO maybe we could generate some default Griffel file with all styles in one slot
  throw new Error('Griffel syntax stringifier can only stringify AST parsed with the custom syntax');
};
