/**
 * Content script: runs in the context of web pages.
 * Auto-runs logo swap when page/supported logos load; also runs on popup button.
 */
import { runLogoSwap, isSupportedSite } from '../logo-swap/run';
import type { LogoSwapResult } from '../logo-swap/types';

console.log('[Premium Extension] Content script loaded on', window.location.href);

/** Tag names that indicate a logo may have been added (per-site, extend as needed). */
const LOGO_TAGS = new Set(['YTD-LOGO', 'YTD-YOODLE-RENDERER', 'YTD-TOPBAR-LOGO']);

function runSwapDebounced(): void {
  runLogoSwap();
}

const LOGO_SELECTOR = 'ytd-logo, ytd-yoodle-renderer, ytd-topbar-logo';

/** Returns true if node or its descendants contain a logo-related element. */
function containsLogoNode(root: Node): boolean {
  if (root.nodeType !== Node.ELEMENT_NODE) return false;
  const el = root as Element;
  if (LOGO_TAGS.has(el.tagName)) return true;
  return el.querySelector?.(LOGO_SELECTOR) !== null;
}

function observeMutations(): void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleSwap = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runSwapDebounced();
    }, 150);
  };

  const checkAndSchedule = (nodes: NodeList | Node[]) => {
    for (const node of nodes) {
      if (containsLogoNode(node)) {
        scheduleSwap();
        return;
      }
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      checkAndSchedule(m.addedNodes);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Observe new shadow roots when they appear
  const watchShadowRoots = (root: Document | ShadowRoot) => {
    root.querySelectorAll('*').forEach((el) => {
      if (el.shadowRoot && !(el as Element & { _premiumObserved?: boolean })._premiumObserved) {
        (el as Element & { _premiumObserved?: boolean })._premiumObserved = true;
        observer.observe(el.shadowRoot, { childList: true, subtree: true });
        watchShadowRoots(el.shadowRoot);
      }
    });
  };

  const shadowObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).shadowRoot) {
          const host = node as Element & { _premiumObserved?: boolean };
          if (!host._premiumObserved) {
            host._premiumObserved = true;
            observer.observe(host.shadowRoot!, { childList: true, subtree: true });
            watchShadowRoots(host.shadowRoot!);
          }
          scheduleSwap();
        }
      });
    }
  });
  shadowObserver.observe(document.documentElement, { childList: true, subtree: true });
  watchShadowRoots(document);
}

/** Re-run logo swap when theme changes (e.g. YouTube html[dark]). */
function observeThemeChange(scheduleSwap: () => void): void {
  let themeDebounce: ReturnType<typeof setTimeout> | null = null;
  const themeObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'dark') {
        if (themeDebounce) clearTimeout(themeDebounce);
        themeDebounce = setTimeout(() => {
          themeDebounce = null;
          scheduleSwap();
        }, 100);
        return;
      }
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dark'],
  });
}

function initAutoSwap(): void {
  if (!isSupportedSite()) return;

  const runWhenReady = () => {
    runSwapDebounced();
    observeMutations();
    observeThemeChange(runSwapDebounced);
  };

  if (document.readyState === 'complete') {
    setTimeout(runWhenReady, 0);
  } else {
    window.addEventListener('load', () => setTimeout(runWhenReady, 0));
  }
}

initAutoSwap();

chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender,
    sendResponse: (response: { url: string; title: string } | LogoSwapResult) => void
  ) => {
    if (message.type === 'GET_PAGE_INFO') {
      sendResponse({
        url: window.location.href,
        title: document.title,
      });
      return true;
    }
    if (message.type === 'SWAP_LOGO') {
      Promise.resolve(runLogoSwap())
        .then((result) => sendResponse(result))
        .catch((err) => {
          sendResponse({
            ok: false,
            siteId: null,
            message: err instanceof Error ? err.message : String(err),
          });
        });
      return true;
    }
    return false;
  }
);
