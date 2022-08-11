// eslint-disable-next-line import/no-extraneous-dependencies
Object.assign(global, require('jest-chrome'));

chrome.devtools.inspectedWindow.getResources.mockImplementation(cb => {
  cb([
    {
      url: 'webpack://testscope/root/packages/test1/src/App.styles.js?42f2',
      type: 'sm-script',
      getContent: () => '',
      setContent: () => ({}),
    },
  ]);
});
