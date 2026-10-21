import { mixColors } from '../color';
import { SCENE_PALETTES, sceneColors } from '../scene-palette';

describe('sceneColors', () => {
  it('returns the sky gradient and four land colours for the phase', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const colors = sceneColors(palette, 'summer', 'day', 'calm');

    // then
    expect(colors).toEqual([...palette.sky.day, ...palette.land.summer]);
  });

  it('turns the sky green when everything is done, whatever the phase', () => {
    // given
    const palette = SCENE_PALETTES.dark;

    // when
    const colors = sceneColors(palette, 'spring', 'night', 'done');

    // then
    expect(colors.slice(0, 2)).toEqual([...palette.sky.done]);
  });

  it('keeps the phase gradient when overdue', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const colors = sceneColors(palette, 'autumn', 'dusk', 'overdue');

    // then
    expect(colors.slice(0, 2)).toEqual([...palette.sky.dusk]);
  });

  it('darkens the land at night, less in winter', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const summer = sceneColors(palette, 'summer', 'night', 'calm');
    const winter = sceneColors(palette, 'winter', 'night', 'calm');

    // then
    expect(summer.slice(2)).not.toEqual([...palette.land.summer]);
    expect(winter.slice(2)).not.toEqual(summer.slice(2));
  });

  it('blends the land halfway to night at dawn and dusk', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const dawn = sceneColors(palette, 'spring', 'dawn', 'calm');
    const dusk = sceneColors(palette, 'spring', 'dusk', 'calm');
    const night = sceneColors(palette, 'spring', 'night', 'calm');

    // then
    expect(dawn.slice(2)).toEqual(dusk.slice(2));
    expect(dawn.slice(2)).not.toEqual(night.slice(2));
  });

  it('keeps the light night sky dark, like the dark theme', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const colors = sceneColors(palette, 'summer', 'night', 'calm');

    // then
    expect(colors.slice(0, 2)).toEqual([...SCENE_PALETTES.dark.sky.night]);
  });

  it('darkens the light land at night more than at dusk', () => {
    // given
    const palette = SCENE_PALETTES.light;

    // when
    const dusk = sceneColors(palette, 'summer', 'dusk', 'calm');
    const night = sceneColors(palette, 'summer', 'night', 'calm');

    // then
    expect(night[5]).not.toEqual(dusk[5]);
    expect(luminance(night[5])).toBeLessThan(luminance(dusk[5]));
    expect(luminance(night[5])).toBeLessThan(80);
  });

  it('keeps the done sky dark at night in light mode only', () => {
    // given
    const light = SCENE_PALETTES.light;
    const dark = SCENE_PALETTES.dark;

    // when
    const lightNight = sceneColors(light, 'spring', 'night', 'done');
    const lightDay = sceneColors(light, 'spring', 'day', 'done');
    const darkNight = sceneColors(dark, 'spring', 'night', 'done');

    // then
    expect(lightNight.slice(0, 2)).toEqual([...light.sky.doneNight]);
    expect(lightDay.slice(0, 2)).toEqual([...light.sky.done]);
    expect(darkNight.slice(0, 2)).toEqual([...dark.sky.done]);
  });

  it('leaves the light dusk land and dark night land as they were', () => {
    // given
    const light = SCENE_PALETTES.light;
    const dark = SCENE_PALETTES.dark;

    // when
    const lightDusk = sceneColors(light, 'spring', 'dusk', 'calm');
    const darkNight = sceneColors(dark, 'spring', 'night', 'calm');

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
