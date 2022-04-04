const isEnabled = () => {
  let griffelDevtoolsEnabled = false;
  if (process.env.NODE_ENV !== 'production') {
    try {
      griffelDevtoolsEnabled = !!window.localStorage['griffelDebug'];
      // eslint-disable-next-line no-empty
    } catch {}
  }

  return griffelDevtoolsEnabled;
};

export const isDevToolsEnabled = isEnabled();
