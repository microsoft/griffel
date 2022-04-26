export const isDevToolsEnabled = Boolean(
  typeof window !== 'undefined' && window?.sessionStorage?.getItem('__GRIFFEL_DEVTOOLS__'),
);
