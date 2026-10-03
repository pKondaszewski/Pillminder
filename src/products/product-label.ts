export function productLabel(
  name: string,
  strength: string | null | undefined,
): string {
  const trimmed = strength?.trim();
  return trimmed ? `${name} ${trimmed}` : name;
}
