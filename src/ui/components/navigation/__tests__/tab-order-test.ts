import { neighbourTab, tabIndexOf } from '../tab-order';

describe('neighbourTab', () => {
  it('returns the next tab for a forward swipe', () => {
    // given
    const pathname = '/products';

    // when
    const result = neighbourTab(pathname, 1);

    // then
    expect(result).toBe('/schedules');
  });

  it('returns the previous tab for a backward swipe', () => {
    // given
    const pathname = '/settings';

    // when
    const result = neighbourTab(pathname, -1);

    // then
    expect(result).toBe('/schedules');
  });

  it('returns null past either end of the tab bar', () => {
    // when
    const beforeFirst = neighbourTab('/', -1);
    const afterLast = neighbourTab('/settings', 1);

    // then
    expect(beforeFirst).toBeNull();
    expect(afterLast).toBeNull();
  });

  it.each(['/products/abc', '/schedules/new', '/history'])(
    'does not swipe on the stack screen %s',
    (pathname) => {
      // when
      const result = neighbourTab(pathname, 1);

      // then
      expect(result).toBeNull();
      expect(tabIndexOf(pathname)).toBe(-1);
    },
  );
});
