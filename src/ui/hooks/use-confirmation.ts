import { useState } from 'react';

export type Confirmation<T = void> = {
  pending: { value: T } | null;
  request: (value: T) => void;
  confirm: () => void;
  cancel: () => void;
};

export function useConfirmation<T = void>(
  onConfirm: (value: T) => void,
): Confirmation<T> {
  const [pending, setPending] = useState<{ value: T } | null>(null);

  return {
    pending,
    request: (value) => setPending({ value }),
    confirm: () => {
      if (!pending) return;
      setPending(null);
      onConfirm(pending.value);
    },
    cancel: () => setPending(null),
  };
}
