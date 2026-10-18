import { categoryAvatar } from '../category-avatar';

describe('categoryAvatar', () => {
  it.each([
    ['medication', 'add'],
    ['supplement', 'eco'],
    ['care', 'sanitizer'],
  ])('uses the %s tile with the %s icon', (category, icon) => {
    // when
    const result = categoryAvatar(category);

    // then
    expect(result).toEqual({ tone: category, icon });
  });

  it('falls back to the custom tile for a user-defined category', () => {
    // when
    const result = categoryAvatar('Eye drops');

    // then
    expect(result).toEqual({ tone: 'custom', icon: 'sell' });
  });
});
