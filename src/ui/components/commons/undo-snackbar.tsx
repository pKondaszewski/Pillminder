import type { UndoSnackbarState } from '@/ui/hooks/use-undo-snackbar';

import { Snackbar } from './snackbar';

export function UndoSnackbar({
  snackbar,
}: {
  snackbar: UndoSnackbarState | null;
}) {
  if (!snackbar) return null;
  const { key, ...props } = snackbar;
  return <Snackbar key={key} {...props} />;
}
