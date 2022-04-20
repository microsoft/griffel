chrome.devtools.panels.elements.createSidebarPane('💅 Griffel', sidebarPanel => {
  sidebarPanel.setPage('index.html');

  sidebarPanel.onShown.addListener(devtoolsWindow => {
    devtoolsWindow.postMessage({ visible: true }, '*');
  });
});
