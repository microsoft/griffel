import * as React from 'react';
import { Story } from '@storybook/react';

import { makeStyles, shorthands, TextDirectionProvider } from '../';

const useStyles = makeStyles({
  shouldFallbackToRed: {
    color: ['red', 'invalid'],
    ...shorthands.border(['1px'], 'solid', ['red', 'invalid']),
    ...shorthands.borderRight('40px', 'solid', ['green', 'invalid']),
    borderTopStyle: ['hidden', 'dashed'],
  },
  shouldBeBlue: {
    color: ['red', 'blue'],
    ...shorthands.border('1px', 'solid', ['red', 'blue']),
    ...shorthands.borderRight('40px', 'solid', ['green', 'grey']),
    borderRightWidth: '100px',
  },
});

const FallbackTest = ({ isRtl = false }) => {
  const classes = useStyles();
  return (
    <>
      <p className={classes.shouldBeBlue}>
        Colour and border should be blue, {isRtl ? 'left' : 'right'} wide border grey.
      </p>
      <p className={classes.shouldFallbackToRed}>
        Colour and border should fallback to red, {isRtl ? 'left' : 'right'} wide border to green.
      </p>
    </>
  );
};

export const FallbackValues: Story = () => {
  return (
    <div>
      <FallbackTest />
      <TextDirectionProvider dir="rtl">
        <div dir="rtl">
          <h2>RTL</h2>
          <FallbackTest isRtl />
        </div>
      </TextDirectionProvider>
    </div>
  );
};
