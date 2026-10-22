import {
  authenticateAsync,
  getEnrolledLevelAsync,
  SecurityLevel,
} from 'expo-local-authentication';
import {
  allowScreenCaptureAsync,
  preventScreenCaptureAsync,
} from 'expo-screen-capture';

export type AuthResult = 'success' | 'failed' | 'notSecured';

const SCREEN_CAPTURE_KEY = 'app-lock';

export async function isDeviceSecured(): Promise<boolean> {
  return (await getEnrolledLevelAsync()) !== SecurityLevel.NONE;
}

export async function authenticate(promptMessage: string): Promise<AuthResult> {
  const result = await authenticateAsync({ promptMessage });
  if (result.success) return 'success';
  const { error } = result;
  return error === 'not_enrolled' || error === 'passcode_not_set'
    ? 'notSecured'
    : 'failed';
}

// FLAG_SECURE also hides the app in the recent apps preview
export function setScreenCaptureBlocked(blocked: boolean): Promise<void> {
  return blocked
    ? preventScreenCaptureAsync(SCREEN_CAPTURE_KEY)
    : allowScreenCaptureAsync(SCREEN_CAPTURE_KEY);
}
