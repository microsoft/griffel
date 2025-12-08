import * as React from 'react';
import type { StoryObj } from '@storybook/react-webpack5';

import { makeStyles, mergeClasses, shorthands } from '../';

const tokens = {
  brandBackground: '#106ebe',
  brandBackgroundHover: '#2899f5',
};

const useButtonStyles = makeStyles({
  root: {
    backgroundColor: 'transparent',
    outlineStyle: 'none',
    ...shorthands.borderRadius('.3em'),
    ...shorthands.border('1px', 'solid', '#333'),
    ...shorthands.padding('.3em', '1em'),
    ':hover': {
      cursor: 'pointer',
      backgroundColor: '#ddd',
    },
  },

  primary: {
    backgroundColor: tokens.brandBackground,
    color: '#eff6fc',
    ':hover': {
      backgroundColor: tokens.brandBackgroundHover,
    },
  },
});

const Button: React.FunctionComponent<{ className?: string; primary?: boolean }> = ({
  className,
  primary = false,
  ...props
}) => {
  const classes = useButtonStyles();
  const mergedClasses = mergeClasses(classes.root, primary && classes.primary, className);
  return <button {...props} className={mergedClasses} />;
};

export const ComponentStyles: StoryObj<{ primary: boolean }> = {
  render: args => {
    return <Button {...args}>button</Button>;
  },

  args: {
    primary: false,
  },
};

export default {
  title: 'Component styles',
};
