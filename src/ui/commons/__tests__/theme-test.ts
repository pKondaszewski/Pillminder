import { ACCENT_COLORS, Colors } from '@/ui/commons/constants/theme';

const WHITE = '#ffffff';
// Matching blue on both white and black needs equal luminance, so allow rounding slack.
const TOLERANCE = 0.05;

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

describe('accent colors', () => {
  it.each(Object.entries(ACCENT_COLORS))(
    '%s is as readable as blue',
    (_name, accent) => {
      // given
      const blueContrasts = contrastsOf(ACCENT_COLORS.blue);

      // when
      const contrasts = contrastsOf(accent);

      // then
      expect(contrasts.onWhiteText).toBeGreaterThanOrEqual(
        blueContrasts.onWhiteText - TOLERANCE,
      );
      expect(contrasts.onLightBackground).toBeGreaterThanOrEqual(
        blueContrasts.onLightBackground - TOLERANCE,
      );
      expect(contrasts.onDarkBackground).toBeGreaterThanOrEqual(
        blueContrasts.onDarkBackground - TOLERANCE,
      );
    },
  );
});

function contrastsOf(accent: string) {
  return {
    onWhiteText: contrastRatio(WHITE, accent),
    onLightBackground: contrastRatio(accent, Colors.light.background),
    onDarkBackground: contrastRatio(accent, Colors.dark.background),
  };
}
