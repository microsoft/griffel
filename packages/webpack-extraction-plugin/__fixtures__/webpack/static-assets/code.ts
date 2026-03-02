import _asset from './blank.jpg';
import { __staticStyles } from '@griffel/react';

export const useStaticStyles = __staticStyles({
  d: [`@font-face{font-family:TestFont;src:url(${_asset}) format("woff2");}`],
});
