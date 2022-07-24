/**
 * injectScript - Inject internal script to get access to host page's `window` object
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append.
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
function injectScript(file_path, tag = 'html') {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file_path);
  node.appendChild(script);
}
injectScript(chrome.runtime.getURL('page-script.js'));

/**
 * listen to request from extension code
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.name === 'extension_request-source' && request.filepath) {
    window.postMessage({
      from: 'extension-script_request-source',
      filepath: request.filepath,
    });
    sendResponse({ success: true });
  }
});

const handleMessageFromPage = async event => {
  if (event.data.from === 'page_respond-source' && event.data.filepath) {
    const filepath = event.data.filepath;
    const result = event.data.data;
    if (result) {
      chrome.runtime.sendMessage({ name: 'extension-script_respond-source', success: true, filepath, result });
      return;
    }
    chrome.runtime.sendMessage({ name: 'extension-script_respond-source', success: false, filepath });
  }
};
window.addEventListener('message', handleMessageFromPage);
