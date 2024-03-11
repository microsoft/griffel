import * as React from 'react';
import { makeStyles, mergeClasses } from '../';

const useButtonStyles = makeStyles({
  root: {
    background: '#f5f5f5',
    border: '1px solid #333',
    borderRadius: '3px',
    color: '#1f1f1f',
    outlineStyle: 'none',
    padding: '10px',
    paddingLeft: '5px',

    ':hover': {
      cursor: 'pointer',
      background: '#ddd',
    },
  },

  primary: {
    backgroundColor: '#106ebe',
    color: '#eff6fc',

    ':hover': {
      backgroundColor: '#2899f5',
    },
  },

  inverted: {
    background: '#1f1f1f',
    color: '#f5f5f5',
  },

  invertedPrimary: {
    backgroundColor: '#eff6fc',
    color: '#106ebe',
  },

  large: {
    padding: '20px',
  },
});

const Button: React.FunctionComponent<{
  className?: string;
  children?: React.ReactNode;
  large?: boolean;
  inverted?: boolean;
  primary?: boolean;
}> = ({ className, primary = false, inverted = false, large = false, ...props }) => {
  const classes = useButtonStyles();
  const mergedClasses = mergeClasses(
    classes.root,
    primary && classes.primary,
    large && classes.large,
    inverted && classes.inverted,
    inverted && primary && classes.invertedPrimary,
    className,
  );

  return <button {...props} className={mergedClasses} />;
};

export const ShorthandStyles = () => {
  return (
    <>
      <Button>button</Button>
      <Button primary>button</Button>
      <Button large>button</Button>
      <Button inverted>button</Button>
      <Button inverted primary>
        button
      </Button>
    </>
  );
};

export default {
  title: 'Shorthands styles',
};
