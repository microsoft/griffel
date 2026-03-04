import { makeResetStyles } from '@griffel/react';
import _asset from './blank.jpg';

export const useClassName = makeResetStyles({
  backgroundImage: `url(${_asset})`,
});
