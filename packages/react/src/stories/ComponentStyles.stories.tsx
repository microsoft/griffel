import * as React from 'react';
import { Story } from '@storybook/react';
import { makeStyles, mergeClasses, shorthands } from '../';

// const tokens = {
//   brandBackground: '#106ebe',
//   brandBackgroundHover: '#2899f5',
// };

const useButtonStyles = makeStyles({
  root: {
    marginLeft: '10px', //  Frg6f3: ['f1oou7ox', 'f1pxv85q']
    color: 'pink', // sj55zd: 'fcg4t7g',
    ':hover': {
      color: 'red', // Bi91k9c: 'faf35ka'
    },
  },

  primary: {
    color: 'blue', // sj55zd: 'f163i14w'
  },

  darkHover: {
    ':hover': {
      color: 'darkblue', // Bi91k9c: 'f1ja742n'
    },
  },
});

// classesMapBySlot
// {
//   root: { Frg6f3: ['f1oou7ox', 'f1pxv85q'], sj55zd: 'fcg4t7g', Bi91k9c: 'faf35ka' },
//   primary: { sj55zd: 'f163i14w' },
//   darkHover: { Bi91k9c: 'f1ja742n' }
// };

// cssRules
// {
//   d: [
//     '.f1oou7ox{margin-left:10px;}',
//     '.f1pxv85q{margin-right:10px;}',
//     '.fcg4t7g{color:pink;}',
//     '.f163i14w{color:blue;}',
//   ],
//   h: [
//     '.faf35ka:hover{color:red;}',
//     '.f1ja742n:hover{color:darkblue;}'
//   ],
// };

// DEFINITION_LOOKUP_TABLE
// {
//   // --> classesMapBySlot.root
//   ___6itd4x0: [{ Frg6f3: ['f1oou7ox', 'f1pxv85q'], sj55zd: 'fcg4t7g', Bi91k9c: 'faf35ka' }, 'ltr'],

//   // --> classesMapBySlot.primary
//   ___1jbu1wa: [{ sj55zd: 'f163i14w' }, 'ltr'],

//   // --> classesMapBySlot.darkHover
//   ___9yjdox0: [{ Bi91k9c: 'f1ja742n' }, 'ltr'],

//   // --> classesMapBySlot.root + classesMapBySlot.primary
//   ___181ajrl: [{ Frg6f3: ['f1oou7ox', 'f1pxv85q'], sj55zd: 'f163i14w', Bi91k9c: 'faf35ka' }, 'ltr'],

//   // --> classesMapBySlot.darkHover + ___181ajrl
//   ___wlm69a0: [{ Frg6f3: ['f1oou7ox', 'f1pxv85q'], sj55zd: 'f163i14w', Bi91k9c: 'f1ja742n' }, 'ltr'],
// };

const Button: React.FunctionComponent<{ className?: string; primary?: boolean; darkHover?: boolean }> = ({
  className,
  primary = false,
  darkHover = false,
  ...props
}) => {
  const classes = useButtonStyles();
  const mergedClasses1 = mergeClasses(classes.root, primary && classes.primary, className);
  const mergedClasses2 = mergeClasses(mergedClasses1, darkHover && classes.darkHover);
  return <button {...props} className={mergedClasses2} />;
};

export const ComponentStyles: Story<{ primary: boolean; darkHover?: boolean }> = args => {
  return <Button {...args}>button</Button>;
};

ComponentStyles.args = {
  primary: true,
  darkHover: true,
};
