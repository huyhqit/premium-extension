/**
 * YouTube: swap logo to YouTube Premium style.
 * Targets: header logo + yoodle (picture) when present.
 */
import type { LogoSwapResult } from '../types';

const YOUTUBE_PREMIUM_LOGO_FALLBACK = 'https://www.gstatic.com/youtube/img/branding/youtubelogo/svg/youtubelogo_2.svg';

/** Parse a CSS color value to RGB 0–255; returns null if unparseable. */
function parseColorToRgb(value: string): [number, number, number] | null {
  const v = value.trim();
  if (!v || v.startsWith('var(')) return null;
  const hex = v.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return [r, g, b];
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  const rgb = v.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

/** Relative luminance (0 = black, 1 = white). */
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Detect dark theme via --yt-spec-base-background (dark color = dark theme). Fallback: html[dark], then prefers-color-scheme. */
function isDarkTheme(): boolean {
  if (typeof document === 'undefined' || !document.documentElement) return false;
  try {
    const el = document.documentElement;
    const bg = getComputedStyle(el).getPropertyValue('--yt-spec-base-background').trim();
    if (bg) {
      const rgb = parseColorToRgb(bg);
      if (rgb) {
        const L = luminance(rgb[0], rgb[1], rgb[2]);
        return L < 0.5;
      }
    }
    if (el.hasAttribute('dark')) return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

/** Light theme = current logo; dark theme = dark variant. */
function getPremiumLogoUrl(): string {
  const dark = isDarkTheme();
  try {
    return chrome.runtime.getURL(dark ? 'icons/logo-youtube-premium-dark.svg' : 'icons/logo-youtube-premium.svg');
  } catch {
    return YOUTUBE_PREMIUM_LOGO_FALLBACK;
  }
}

/** Collect all elements matching selector in document and inside every shadow root. */
function queryAllDeep(root: Document | ShadowRoot, selector: string): Element[] {
  const out: Element[] = [];
  try {
    out.push(...root.querySelectorAll(selector));
    root.querySelectorAll('*').forEach((el) => {
      if (el.shadowRoot) {
        out.push(...queryAllDeep(el.shadowRoot, selector));
      }
    });
  } catch {
    // ignore
  }
  return out;
}

export function runYoutubeLogoSwap(): LogoSwapResult {
  let replacedCount = 0;
  const premiumUrl = getPremiumLogoUrl();

  // 1) Header logo: ytd-logo #logo-icon (often contains img or div with background)
  const headerLogoImg = document.querySelector(
    'ytd-logo img, ytd-logo a img, #logo-icon img, a#logo img'
  ) as HTMLImageElement | null;
  if (headerLogoImg) {
    headerLogoImg.src = premiumUrl;
    headerLogoImg.srcset = '';
    replacedCount++;
  }

  // 2) Swap yoodle img src to premium logo
  const yoodleImgSelectors = [
    'picture.style-scope.ytd-yoodle-renderer img',
    'ytd-yoodle-renderer img',
    'img.style-scope.ytd-yoodle-renderer',
    'img.ytd-yoodle-renderer',
  ];
  const seen = new WeakSet<Element>();
  for (const selector of yoodleImgSelectors) {
    const pictureImgs = queryAllDeep(document, selector);
    pictureImgs.forEach((img) => {
      if (seen.has(img)) return;
      seen.add(img);
      const el = img as HTMLImageElement;
      el.src = premiumUrl;
      el.srcset = '';
      replacedCount++;
    });
  }

  // 4) Fallback: any img inside ytd-logo
  const ytdLogo = document.querySelector('ytd-logo');
  if (ytdLogo) {
    const img = ytdLogo.querySelector('img');
    if (img) {
      img.src = premiumUrl;
      img.srcset = '';
      replacedCount++;
    }
  }

  return {
    ok: true,
    siteId: 'youtube',
    message:
      replacedCount > 0 ? `Đã đổi ${replacedCount} logo trên YouTube.` : 'Không tìm thấy logo để đổi trên trang này.',
    replacedCount,
  };
}
