import {
  canPanHorizontally,
  clampScale,
  clampTranslation,
  doubleTapScale,
  translationAfterZoom,
} from '../photo-zoom';

const view = { width: 400, height: 800 };

describe('clampScale', () => {
  it('keeps the scale within the allowed range', () => {
    // given
    const scales = [0.4, 2, 9];

    // when
    const result = scales.map(clampScale);

    // then
    expect(result).toEqual([1, 2, 5]);
  });
});

describe('doubleTapScale', () => {
  it('zooms in from 1x', () => {
    // when
    const result = doubleTapScale(1);

    // then
    expect(result).toBe(2.5);
  });

  it('returns to 1x from any zoomed state', () => {
    // when
    const result = doubleTapScale(3.2);

    // then
    expect(result).toBe(1);
  });
});

describe('clampTranslation', () => {
  it('limits the shift to the overflow of the zoomed image', () => {
    // given
    const translation = { x: 500, y: -900 };

    // when
    const result = clampTranslation(translation, 2, view);

    // then
    expect(result).toEqual({ x: 200, y: -400 });
  });

  it('allows no shift at 1x', () => {
    // when
    const result = clampTranslation({ x: 30, y: -30 }, 1, view);

    // then
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('translationAfterZoom', () => {
  it('keeps the point under the finger in place', () => {
    // given
    const focal = { x: 100, y: 0 };

    // when
    const result = translationAfterZoom({ x: 0, y: 0 }, 1, 2.5, focal, view);

    // then
    expect(result).toEqual({ x: -150, y: 0 });
  });

  it('clamps a tap near the edge so no empty margin shows', () => {
    // given
    const focal = { x: 200, y: 0 };

    // when
    const result = translationAfterZoom({ x: 0, y: 0 }, 1, 2, focal, view);

    // then
    expect(result.x).toBe(-200);
  });

  it('resets the shift when zooming back to 1x', () => {
    // when
    const result = translationAfterZoom(
      { x: -150, y: 40 },
      2.5,
      1,
      { x: 0, y: 0 },
      view,
    );

    // then
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('canPanHorizontally', () => {
  it('never pans at 1x so the gallery pages instead', () => {
    // when
    const result = canPanHorizontally(0, 1, view, 10);

    // then
    expect(result).toBe(false);
  });

  it('pans while the image has room in the swipe direction', () => {
    // when
    const result = canPanHorizontally(50, 2, view, -10);

    // then
    expect(result).toBe(true);
  });

  it('hands over to paging at the edge the finger drags towards', () => {
    // given
    const atLeftEdge = 200;

    // when
    const result = canPanHorizontally(atLeftEdge, 2, view, 10);

    // then
    expect(result).toBe(false);
  });
});
