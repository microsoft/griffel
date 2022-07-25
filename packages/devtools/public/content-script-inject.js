/**
 * Script running in extension context.
 *
 * This content script functions as a bridge between extension code and host page.
 *
 * This script listens to request from extension code
 * and defers the request to host page through `window.postMessage`.
 *
 * After getting response from the host page,
 * this script sends the response back to extension code by `chrome.runtime.sendMessage`
 */

/**
 * injectScript - Inject internal script to get access to host page's `window` object
 *
 * @param {*} file_path Local path of the internal script.
 * @param {*} tag The tag as string, where the script will be append.
 * @see   {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
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
 * listens to request from extension code, and posts message to page-script.js
 */
chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.name === 'extension_request-source' && request.filepath) {
    // send request to host page
    window.postMessage({
      from: 'extension-script_request-source',
      filepath: request.filepath,
    });
    sendResponse({ success: true });
  }
});

/**
 * listens to message from page-script.js, and sends response to extension code
 */
const handleMessageFromPage = async event => {
  if (event.data.from === 'page_respond-source' && event.data.filepath) {
    const filepath = event.data.filepath;
    const result = event.data.data;
    if (result) {
      chrome.runtime.sendMessage({ name: 'extension-script_respond-source', success: true, filepath, result });
    } else {
      chrome.runtime.sendMessage({ name: 'extension-script_respond-source', success: false, filepath });
    }
  }
};
window.addEventListener('message', handleMessageFromPage);
