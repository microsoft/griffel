export const isDevToolsEnabled: boolean = (() => {
  // Accessing "window.sessionStorage" causes an exception when third party cookies are blocked
  // https://stackoverflow.com/questions/30481516/iframe-in-chrome-error-failed-to-read-localstorage-from-window-access-deni
  try {
    return Boolean(typeof window !== 'undefined' && window.sessionStorage?.getItem('__GRIFFEL_DEVTOOLS__'));
  } catch (e) {
    return false;
  }
})();
