import React from 'react';
import { makeStyles, shorthands } from '@griffel/react';

interface SelectProps {
  label: string;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  select: {
    cursor: 'pointer',
    backgroundColor: 'transparent',
    ...shorthands.padding('0', '1em'),
    ...shorthands.borderRadius('4px'),
    boxShadow: 'none',
    boxSizing: 'border-box',
    fontSize: '20px',
    '& option': {},
  },
});

const Select: React.FC<SelectProps & React.SelectHTMLAttributes<HTMLSelectElement>> = props => {
  const { children, label, ...rest } = props;
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <label>{label}</label>
      <select className={styles.select} {...rest}>
        {children}
      </select>
    </div>
  );
};

export default Select;
