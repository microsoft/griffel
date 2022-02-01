import React from 'react';

import { CogsIcon } from '../icons';
import styles from './styles.module.css';

export default function OutputTitle(props) {
  return (
    <div className={styles.container}>
      <CogsIcon />
      <span>{props.children}</span>
    </div>
  );
}
