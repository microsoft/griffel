import * as React from 'react';

import { GithubIcon } from '../../../components/icons';
import styles from './styles.module.css';

function GithubLink() {
  return (
    <a
      aria-label="Go to Griffel GitHub page"
      className={styles['githubLink']}
      href="https://github.com/microsoft/griffel"
      target="_blank"
      rel="noopener noreferrer"
    >
      <GithubIcon />
    </a>
  );
}

export default function () {
  return (
    <div className={styles['container']}>
      {/* Docusaurus does not support declaring JSX elements in Navbar configuration. */}
      {/* This is a hack to re-order Github link & Theme switcher. */}
      {/* The folder cannot be renamed as it's how swizzling works in Docusaurus: */}
      {/* https://docusaurus.io/docs/advanced/swizzling#swizzling-1 */}
      <GithubLink />
    </div>
  );
}
