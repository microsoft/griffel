import React from 'react';

interface SelectProps {
  label: string;
}

const Select: React.FC<SelectProps & React.SelectHTMLAttributes<HTMLSelectElement>> = props => {
  const { children, label, ...rest } = props;
  return (
    <div className="select">
      <label>{label}</label>
      <select {...rest}>{children}</select>
    </div>
  );
};

export default Select;
