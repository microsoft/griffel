import * as React from 'react';
import { useColorMode, useThemeConfig } from '@docusaurus/theme-common';

import { GithubIcon, MoonIcon, SunIcon } from '../../../components/icons';
import styles from './styles.module.css';

function ThemeToggle() {
  const disabled = useThemeConfig().colorMode.disableSwitch;
  const { colorMode, setColorMode } = useColorMode();

  const isDarkMode = colorMode === 'dark';
  const ariaLabel = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
  const icon = isDarkMode ? <SunIcon /> : <MoonIcon />;

  const handleClick = React.useCallback(() => {
    if (isDarkMode) {
      setColorMode('light');
    } else {
      setColorMode('dark');
    }
  }, [isDarkMode, setColorMode]);

  return (
    <button
      aria-label={ariaLabel}
      className={styles['toggleButton']}
      disabled={disabled}
      onClick={handleClick}
      type="button"
    >
      {icon}
    </button>
  );
}

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
      <ThemeToggle />
      <GithubLink />
    </div>
  );
}
