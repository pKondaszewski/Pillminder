export type DayMode = 'today' | 'past' | 'future';

export type RowPressAction = 'open' | 'revert' | 'correct';

export function rowPressAction(
  mode: DayMode,
  handled: boolean,
): RowPressAction {
  if (mode === 'past') return 'correct';
  if (mode === 'today' && handled) return 'revert';
  return 'open';
}
