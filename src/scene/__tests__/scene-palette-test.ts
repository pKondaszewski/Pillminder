import { mixColors } from '../color';
import { SCENE_PALETTES, sceneColors } from '../scene-palette';

describe('sceneColors', () => {
  it('returns the sky gradient and four land colours for the phase', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const colors = sceneColors(palette, 'summer', 'day');

    // then
    expect(colors).toEqual([...palette.sky.day, ...palette.land.summer]);
  });

  it('darkens the land at night, less in winter', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const summer = sceneColors(palette, 'summer', 'night');
    const winter = sceneColors(palette, 'winter', 'night');

    // then
    expect(summer.slice(2)).not.toEqual([...palette.land.summer]);
    expect(winter.slice(2)).not.toEqual(summer.slice(2));
  });

  it('blends the land halfway to night at dawn and dusk', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const dawn = sceneColors(palette, 'spring', 'dawn');
    const dusk = sceneColors(palette, 'spring', 'dusk');
    const night = sceneColors(palette, 'spring', 'night');

    // then
    expect(dawn.slice(2)).toEqual(dusk.slice(2));
    expect(dawn.slice(2)).not.toEqual(night.slice(2));
  });

  it('keeps the light night sky dark, like the dark theme', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const colors = sceneColors(palette, 'summer', 'night');

    // then
    expect(colors.slice(0, 2)).toEqual([...SCENE_PALETTES.dark.sky.night]);
  });

  it('darkens the light land at night more than at dusk', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const dusk = sceneColors(palette, 'summer', 'dusk');
    const night = sceneColors(palette, 'summer', 'night');

    // then
    expect(night[5]).not.toEqual(dusk[5]);
    expect(luminance(night[5])).toBeLessThan(luminance(dusk[5]));
    expect(luminance(night[5])).toBeLessThan(80);
  });

  it('leaves the light dusk land and dark night land as they were', () => {
    // given
    const light = SCENE_PALETTES.light;
    const dark = SCENE_PALETTES.dark;

    // when
    const lightDusk = sceneColors(light, 'spring', 'dusk');
    const darkNight = sceneColors(dark, 'spring', 'night');

    // then
    expect(lightDusk[2]).toEqual(
      mixColors(light.land.spring[0], light.landNight[0], 0.45),
    );
    expect(darkNight[2]).toEqual(
      mixColors(dark.land.spring[0], dark.landNight[0], 0.75),
    );
  });
});

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
