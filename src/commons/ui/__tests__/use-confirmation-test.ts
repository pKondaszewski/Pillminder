import { act, renderHook } from '@testing-library/react-native';

import { useConfirmation } from '@/commons/ui/use-confirmation';

describe('useConfirmation', () => {
  it('holds the requested value until it is confirmed', () => {
    // given
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useConfirmation<string>(onConfirm));

    // when
    act(() => result.current.request('product-1'));

    // then
    expect(result.current.pending).toEqual({ value: 'product-1' });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('passes the value to onConfirm and clears the question on confirm', () => {
    // given
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useConfirmation<string>(onConfirm));
    act(() => result.current.request('product-1'));

    // when
    act(() => result.current.confirm());

    // then
    expect(onConfirm).toHaveBeenCalledWith('product-1');
    expect(result.current.pending).toBeNull();
  });

  it('clears the question without calling onConfirm on cancel', () => {
    // given
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useConfirmation<string>(onConfirm));
    act(() => result.current.request('product-1'));

    // when
    act(() => result.current.cancel());

    // then
    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.pending).toBeNull();
  });

  it('ignores a confirm without a question', () => {
    // given
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useConfirmation<string>(onConfirm));

    // when
    act(() => result.current.confirm());

    // then
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
