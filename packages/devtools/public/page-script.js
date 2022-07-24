let needWebpackSync = true;

const callAsap = typeof requestIdleCallback === 'function' ? requestIdleCallback : fn => Promise.resolve().then(fn);

const knownWebpackChunks = new Map();

const webpackInteralMap = new Map(); // webpack internal url -> its source

function syncWebpackSourceMapsIfNeeded() {
  if (!needWebpackSync) {
    return;
  }

  needWebpackSync = false;
  callAsap(() => (needWebpackSync = true));

  for (const name of Object.keys(window)) {
    if (!name.startsWith('webpackChunk_')) {
      continue;
    }

    const knownSize = knownWebpackChunks.get(name) || 0;
    const storage = window[name];

    if (!Array.isArray(storage)) {
      continue;
    }

    for (let i = knownSize; i < storage.length; i++) {
      const storageEntry = storage[i];

      if (Array.isArray(storageEntry) && storageEntry[1] && typeof storageEntry[1] === 'object') {
        for (const [filepath, fn] of Object.entries(storageEntry[1])) {
          // sourceToResolve(filepath, fn);
          webpackInteralMap.set(filepath, String(fn));
        }
      }
    }

    knownWebpackChunks.set(name, storage.length);
  }
}

const handleMessageFromExtension = async event => {
  if (event.data.from === 'extension-script_request-source' && event.data.filepath) {
    syncWebpackSourceMapsIfNeeded();
    window.postMessage({
      from: `page_respond-source`,
      filepath: event.data.filepath,
      data: webpackInteralMap.get(event.data.filepath),
    });
  }
};
window.addEventListener('message', handleMessageFromExtension);
