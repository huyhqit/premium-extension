/**
 * Spotify: placeholder for future Spotify logo → Spotify Premium swap.
 */
import type { LogoSwapResult } from '../types';

export function runSpotifyLogoSwap(): LogoSwapResult {
  // TODO: add selectors when implementing (e.g. .Root__nav-bar logo)
  const logo = document.querySelector(
    'a[href="/"] svg, [data-testid="logo"]'
  );
  if (!logo) {
    return {
      ok: true,
      siteId: 'spotify',
      message: 'Trang Spotify chưa được hỗ trợ đổi logo.',
      replacedCount: 0,
    };
  }
  return {
    ok: true,
    siteId: 'spotify',
    message: 'Spotify: tính năng đang phát triển.',
    replacedCount: 0,
  };
}
