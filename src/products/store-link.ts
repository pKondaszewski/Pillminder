const MAPS_SEARCH_URL =
  process.env.EXPO_PUBLIC_MAPS_SEARCH_URL ??
  'https://www.google.com/maps/search/?api=1&query=';

export function resolveStoreUrl(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (isUrl(trimmed)) return trimmed;
  return `${MAPS_SEARCH_URL}${encodeURIComponent(trimmed)}`;
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
