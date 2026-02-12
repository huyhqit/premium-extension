/**
 * Registry of logo swappers per site. Add new sites here.
 */
import type { SiteConfig, SiteId } from '../types';
import { runYoutubeLogoSwap } from './youtube';
import { runTwitterLogoSwap } from './twitter';
import { runSpotifyLogoSwap } from './spotify';

const sites: SiteConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    hostnames: ['www.youtube.com', 'youtube.com', 'm.youtube.com'],
    run: runYoutubeLogoSwap,
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    hostnames: ['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com'],
    run: runTwitterLogoSwap,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    hostnames: ['open.spotify.com', 'www.spotify.com', 'spotify.com'],
    run: runSpotifyLogoSwap,
  },
];

const hostToSite = new Map<string | null, SiteConfig>();
for (const site of sites) {
  for (const host of site.hostnames) {
    hostToSite.set(host, site);
  }
}

export function getSwapperForHost(hostname: string): SiteConfig | undefined {
  return hostToSite.get(hostname) ?? hostToSite.get(hostname.replace(/^www\./, '')) ?? undefined;
}

export function getSupportedSiteIds(): SiteId[] {
  return sites.map((s) => s.id);
}

export { sites };
