# Premium Extension

Chrome extension using **Manifest V3**, built with **React**, **TypeScript**, and **Vite**.

## Structure

```
premium-extension/
├── manifest.json              # MV3 manifest (paths point to dist/ output)
├── popup.html                 # Popup entry (built → dist/popup.html)
├── options.html               # Options entry (built → dist/options.html)
├── icons/                     # Extension icons (add icon16.png, icon48.png, icon128.png)
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Background service worker (no DOM)
│   ├── content/
│   │   └── content.ts        # Injected into web pages
│   ├── popup/
│   │   ├── main.tsx           # React entry
│   │   ├── App.tsx
│   │   └── index.css
│   ├── options/
│   │   ├── main.tsx           # React entry
│   │   ├── App.tsx
│   │   └── index.css
│   └── vite-env.d.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

Output is in **`dist/`**. The build copies `manifest.json` and `icons/*.png` into `dist/` so the extension is self-contained.

## Load in Chrome

1. Add icon files in `icons/` (see `icons/README.md`). Without them the extension still loads but may show warnings.
2. Run `npm run build`.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the **`dist`** folder (not the project root).

## Development

- **Watch mode:** `npm run dev` — rebuilds on file changes. Reload the extension on `chrome://extensions/` after changes.
- **Debug popup/options:** Right‑click the popup or options page → Inspect.
- **Debug service worker:** On `chrome://extensions/` → “Inspect views: service worker”.
- **Debug content script:** Use DevTools on the tab where the content script runs.

## Manifest V3 notes

- **Background** is a service worker: no DOM, no `window`; use `chrome.*` APIs and message passing.
- **Permissions** are in `permissions`; site access is in `host_permissions`.
- **Content scripts** are declared in `content_scripts`; optional programmatic injection via `chrome.scripting.executeScript`.
# premium-extension
