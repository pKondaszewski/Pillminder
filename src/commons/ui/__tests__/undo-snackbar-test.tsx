import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import type { UndoSnackbarState } from '@/commons/ui/use-undo-snackbar';

function snackbarState(
  overrides: Partial<UndoSnackbarState> = {},
): UndoSnackbarState {
  return {
    key: 1,
    message: 'Dose taken',
    actionLabel: 'Undo',
    onAction: jest.fn(),
    onDismiss: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('UndoSnackbar', () => {
  it('renders nothing without a state', () => {
    // when
    render(<UndoSnackbar snackbar={null} />);

    // then
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the message and calls the action on press', () => {
    // given
    const snackbar = snackbarState();
    render(<UndoSnackbar snackbar={snackbar} />);

    // when
    fireEvent.press(screen.getByRole('button', { name: 'Undo' }));

    // then
    expect(screen.getByText('Dose taken')).toBeTruthy();
    expect(snackbar.onAction).toHaveBeenCalledTimes(1);
  });

  it('does not dismiss itself before five seconds pass', () => {
    // given
    const snackbar = snackbarState();
    render(<UndoSnackbar snackbar={snackbar} />);

    // when
    act(() => jest.advanceTimersByTime(4999));

    // then
    expect(snackbar.onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses itself after five seconds', () => {
    // given
    const snackbar = snackbarState();
    render(<UndoSnackbar snackbar={snackbar} />);

    // when
    act(() => jest.advanceTimersByTime(5000));

    // then
    expect(snackbar.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when the key changes', () => {
    // given
    const first = snackbarState({ key: 1 });
    const { rerender } = render(<UndoSnackbar snackbar={first} />);
    act(() => jest.advanceTimersByTime(4000));
    const second = snackbarState({ key: 2, message: 'Dose skipped' });

    // when
    rerender(<UndoSnackbar snackbar={second} />);
    act(() => jest.advanceTimersByTime(4000));

    // then
    expect(second.onDismiss).not.toHaveBeenCalled();
    expect(first.onDismiss).not.toHaveBeenCalled();
  });
});
