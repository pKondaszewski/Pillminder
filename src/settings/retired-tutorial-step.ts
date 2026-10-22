// 'hint' was the last tutorial step before the practice reminder replaced it
export function withoutRetiredTutorialStep(
  stored: Record<string, unknown>,
): Record<string, unknown> {
  return stored.tutorialStep === 'hint'
    ? { ...stored, tutorialStep: 'done' }
    : stored;
}
