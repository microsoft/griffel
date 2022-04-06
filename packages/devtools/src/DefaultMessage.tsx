import * as React from 'react';

export const DefaultMessage: React.FC = () => {
  return (
    <div>
      <u aria-hidden>💡️</u>
      <div>
        Please select an element with styles created by <code>makeStyles()</code>.
      </div>
    </div>
  );
};
