/**
 * Run logo swap for the current page based on hostname.
 * Called from content script when user clicks "Đổi logo" in popup or when logos load.
 */
import type { LogoSwapResult } from './types';
import { getSwapperForHost } from './sites';

export function isSupportedSite(): boolean {
  return getSwapperForHost(window.location.hostname) !== undefined;
}

export function runLogoSwap(): LogoSwapResult | Promise<LogoSwapResult> {
  const hostname = window.location.hostname;
  const site = getSwapperForHost(hostname);

  if (!site) {
    return {
      ok: false,
      siteId: null,
      message: `Trang này chưa được hỗ trợ đổi logo. (${hostname})`,
    };
  }

  try {
    return site.run();
  } catch (err) {
    return {
      ok: false,
      siteId: site.id,
      message: 'Lỗi khi đổi logo: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
}
