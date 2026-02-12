/**
 * Twitter/X: placeholder for future Twitter logo → X Premium (or similar) swap.
 */
import type { LogoSwapResult } from '../types';

export function runTwitterLogoSwap(): LogoSwapResult {
  // TODO: add selectors when implementing (e.g. header logo, bird/X icon)
  const headerLogo = document.querySelector(
    'a[aria-label="X"], a[href="/home"] svg, header a svg'
  );
  if (!headerLogo) {
    return {
      ok: true,
      siteId: 'twitter',
      message: 'Trang Twitter chưa được hỗ trợ đổi logo.',
      replacedCount: 0,
    };
  }
  return {
    ok: true,
    siteId: 'twitter',
    message: 'Twitter: tính năng đang phát triển.',
    replacedCount: 0,
  };
}
