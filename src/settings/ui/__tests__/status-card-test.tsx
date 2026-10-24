import { fireEvent, render, screen } from '@testing-library/react-native';

import { StatusCard } from '@/settings/ui/status-card';

describe('StatusCard', () => {
  it('shows the title and the status', () => {
    // when
    render(<StatusCard ok title="Notifications" status="Allowed" />);

    // then
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Allowed')).toBeTruthy();
  });

  it.each([
    { name: 'ok', props: { ok: true } },
    { name: 'neutral', props: { ok: false, neutral: true } },
    { name: 'not ok', props: { ok: false } },
  ])('calls onFix when the fix button is pressed ($name)', ({ props }) => {
    // given
    const onFix = jest.fn();
    render(
      <StatusCard
        {...props}
        title="Notifications"
        status="Blocked"
        fixLabel="Open settings"
        onFix={onFix}
      />,
    );

    // when
    fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));

    // then
    expect(onFix).toHaveBeenCalledTimes(1);
  });

  it('has no button without an action', () => {
    // when
    render(<StatusCard ok title="Battery" status="Unrestricted" />);

    // then
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has no button when the label is missing', () => {
    // when
    render(
      <StatusCard
        ok={false}
        title="Battery"
        status="Restricted"
        onFix={jest.fn()}
      />,
    );

    // then
    expect(screen.queryByRole('button')).toBeNull();
  });
});
