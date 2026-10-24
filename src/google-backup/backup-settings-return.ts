export type BackupSettingsPhase = 'idle' | 'opened' | 'left';

export function nextBackupSettingsPhase(
  phase: BackupSettingsPhase,
  appState: string,
): { phase: BackupSettingsPhase; shouldAsk: boolean } {
  if (phase === 'idle') return { phase, shouldAsk: false };
  if (appState !== 'active') return { phase: 'left', shouldAsk: false };
  if (phase === 'left') return { phase: 'idle', shouldAsk: true };
  return { phase, shouldAsk: false };
}
