import classnames from 'classnames';
import * as React from 'react';

import './view-styles.css';

const View: React.FC<React.PropsWithChildren<{ className: string }>> = props => {
  return <div {...props} className={classnames('initial', props.className)} />;
};

export default View;
