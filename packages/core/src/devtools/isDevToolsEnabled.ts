const isEnabled = () => {
  let enabled = false;
  if (process.env.NODE_ENV !== 'production') {
    try {
      const griffelDevtoolsEnabled = !!window.localStorage['griffelDebug'];

      if (process.env.NODE_ENV !== 'test') {
        if (griffelDevtoolsEnabled) {
          console.warn(
            [
              '@griffel/core:',
              `devtools are enabled.`,
              'To remove this override paste `delete window.localStorage.griffelDebug` to your browser console and reload the page.',
            ].join(' '),
          );
        } else {
          console.warn(
            [
              '@griffel/core:',
              `devtools are disabled.`,
              'To enable devtools paste `window.localStorage.griffelDebug = true` to your browser console and reload the page.',
            ].join(' '),
          );
        }
      }

      enabled = griffelDevtoolsEnabled;
      // eslint-disable-next-line no-empty
    } catch {}
  }

  return enabled;
};

export const isDevToolsEnabled = isEnabled();
