import * as Haptics from 'expo-haptics';

// Haptics rejects when the system has vibration turned off; that is not an error for the app.
const ignoreFailure = () => undefined;

export function tapHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignoreFailure);
}

export function successHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    ignoreFailure,
  );
}
