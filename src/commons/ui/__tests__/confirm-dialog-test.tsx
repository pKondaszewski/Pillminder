import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { translate } from '@/commons/ui/testing/test-i18n';

function renderDialog(
  props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {},
) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(
    <ConfirmDialog
      visible
      title="Delete product?"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it.each([{ destructive: true }, { destructive: false }])(
    'calls onConfirm on confirm (%o)',
    ({ destructive }) => {
      // given
      const { onConfirm } = renderDialog({ destructive });

      // when
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));

      // then
      expect(onConfirm).toHaveBeenCalledTimes(1);
    },
  );

  it.each([{ destructive: true }, { destructive: false }])(
    'calls onCancel on cancel (%o)',
    ({ destructive }) => {
      // given
      const { onCancel } = renderDialog({ destructive });

      // when
      fireEvent.press(
        screen.getByRole('button', { name: translate('editor.cancel') }),
      );

      // then
      expect(onCancel).toHaveBeenCalledTimes(1);
    },
  );

  it('shows the title, message and bullets', () => {
    // when
    renderDialog({
      destructive: true,
      message: 'This cannot be undone.',
      bullets: ['3 schedules', '12 doses'],
    });

    // then
    expect(screen.getByText('Delete product?')).toBeTruthy();
    expect(screen.getByText('This cannot be undone.')).toBeTruthy();
    expect(screen.getByText('• 3 schedules')).toBeTruthy();
    expect(screen.getByText('• 12 doses')).toBeTruthy();
  });

  it('uses a custom cancel label', () => {
    // when
    renderDialog({ destructive: true, cancelLabel: 'Keep it' });

    // then
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeTruthy();
  });

  it('cancels when the backdrop is pressed', () => {
    // given
    const { onCancel } = renderDialog({ destructive: true });

    // when
    fireEvent.press(screen.getByLabelText(translate('editor.close')));

    // then
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders nothing while hidden', () => {
    // when
    renderDialog({ visible: false, destructive: true });

    // then
    expect(screen.queryByText('Delete product?')).toBeNull();
  });
});
