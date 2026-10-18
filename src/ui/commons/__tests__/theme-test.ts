import { Colors } from '@/ui/commons/constants/theme';

const MIN_TEXT_CONTRAST = 4.5;

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe.each(['light', 'dark'] as const)('%s theme', (scheme) => {
  it.each([
    ['onAccent', 'accent'],
    ['accent', 'background'],
    ['text', 'background'],
    ['textSecondary', 'background'],
    ['danger', 'background'],
    ['onAccent', 'danger'],
    ['textSecondary', 'surface'],
  ] as const)('%s is readable on %s', (foreground, background) => {
    // given
    const colors = Colors[scheme];

    // when
    const ratio = contrastRatio(colors[foreground], colors[background]);

    // then
    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });
});
