/**
 * Background service worker (Manifest V3).
 * No DOM/window access; use chrome.* APIs and Message Passing for UI.
 */

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] Extension installed', details.reason);

  if (details.reason === 'install') {
    chrome.storage.local.set({ installedAt: Date.now() });
  } else if (details.reason === 'update') {
    // Extension updated
  }
});

chrome.action.onClicked.addListener(() => {
  // Popup handles the click by default; use this only if you remove default_popup
});

chrome.runtime.onMessage.addListener(
  (message: { type: string }, _sender, sendResponse: (response: unknown) => void) => {
    if (message.type === 'PING') {
      sendResponse({ ok: true, source: 'service-worker' });
      return true;
    }
    return true;
  }
);
