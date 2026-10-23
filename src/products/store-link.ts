import type { StoreLinkTarget } from './dto/store-link-target';

const MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=';
const WEB_SEARCH_URL = 'https://www.google.com/search?q=';

export function isPlainTextStore(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  return !!trimmed && !isUrl(trimmed);
}

export function mustAskStoreTarget(
  storeLink: string | null | undefined,
  target: StoreLinkTarget | null,
): boolean {
  return target === null && isPlainTextStore(storeLink);
}

export function resolveStoreUrl(
  value: string | null | undefined,
  target: StoreLinkTarget | null,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (isUrl(trimmed)) return trimmed;
  const searchUrl = target === 'web' ? WEB_SEARCH_URL : MAPS_SEARCH_URL;
  return `${searchUrl}${encodeURIComponent(trimmed)}`;
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
