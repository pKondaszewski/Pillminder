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
});
