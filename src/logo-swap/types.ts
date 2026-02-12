/**
 * Logo swap: types for extensible per-site logo replacement.
 */

export type SiteId = 'youtube' | 'twitter' | 'spotify';

export interface LogoSwapResult {
  ok: boolean;
  siteId: SiteId | null;
  message: string;
  replacedCount?: number;
}

/** Per-site swapper: runs in content script, returns result. */
export type LogoSwapper = () => LogoSwapResult | Promise<LogoSwapResult>;

export interface SiteConfig {
  id: SiteId;
  name: string;
  hostnames: string[];
  run: LogoSwapper;
}
