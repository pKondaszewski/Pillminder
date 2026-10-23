import { withProfilePhoto } from '../pending-photos';

describe('withProfilePhoto', () => {
  it('moves the chosen photo first and keeps the order of the rest', () => {
    // given
    const uris = ['a', 'b', 'c', 'd'];

    // when
    const result = withProfilePhoto(uris, 'c');

    // then
    expect(result).toEqual(['c', 'a', 'b', 'd']);
  });

  it('leaves the order when the chosen photo is already first', () => {
    // given
    const uris = ['a', 'b'];

    // when
    const result = withProfilePhoto(uris, 'a');

    // then
    expect(result).toEqual(['a', 'b']);
  });

  it('ignores a photo that is not in the list', () => {
    // given
    const uris = ['a', 'b'];

    // when
    const result = withProfilePhoto(uris, 'gone');

    // then
    expect(result).toEqual(['a', 'b']);
  });

  it('does not mutate the input', () => {
    // given
    const uris = ['a', 'b'];

    // when
    withProfilePhoto(uris, 'b');

    // then
    expect(uris).toEqual(['a', 'b']);
  });
});
