export async function runReportingErrors<T>(
  action: () => Promise<T>,
  onSuccess: ((result: T) => void) | undefined,
  onError: () => void,
): Promise<void> {
  try {
    const result = await action();
    // `?.` skips evaluating its arguments when the callback is undefined, so
    // `onSuccess?.(await action())` would never run the action
    onSuccess?.(result);
  } catch {
    onError();
  }
}
