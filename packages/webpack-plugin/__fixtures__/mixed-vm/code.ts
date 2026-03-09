import { makeStyles, makeResetStyles } from '@griffel/react';
import { tokens } from './consts';

const avatarSpacing = '--avatar-spacing';

export const useStyles = makeStyles({
  before: {
    justifyItems: 'end',
    gridTemplateColumns: 'auto [middle] max-content',
  },
  media: {
    gridRowStart: 'span 5',
  },
});
export const useAvatarSpacingStyles = makeStyles({
  'extra-small': {
    [avatarSpacing]: tokens.spacingHorizontalSNudge,
  },
});

export const usePrimaryTextBaseClassName = makeResetStyles({
  display: 'block',
  color: tokens.colorNeutralForeground1,
});

export const useTextStyles = makeStyles({
  beforeAlignToPrimary: {
    gridColumnEnd: 'middle',
  },
  afterAlignToPrimary: {
    gridColumnStart: 'middle',
  },
});
