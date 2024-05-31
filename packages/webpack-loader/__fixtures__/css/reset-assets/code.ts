import { makeResetStyles } from '@griffel/react';
import asset from './blank.jpg';

export const useClassName = makeResetStyles({
  backgroundImage: `url(${asset})`,
});
