const TAB_ORDER = ['/', '/products', '/schedules', '/settings'] as const;

export type TabPath = (typeof TAB_ORDER)[number];

export function tabIndexOf(pathname: string): number {
  return (TAB_ORDER as readonly string[]).indexOf(pathname);
}

export function neighbourTab(pathname: string, offset: 1 | -1): TabPath | null {
  const index = tabIndexOf(pathname);
  if (index < 0) return null;
  return TAB_ORDER[index + offset] ?? null;
}
