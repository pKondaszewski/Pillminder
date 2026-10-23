import * as ImagePicker from 'expo-image-picker';

import type { ImageSource } from './dto/image-source';

export type PickResult =
  | { status: 'picked'; uris: string[] }
  | { status: 'cancelled' }
  | { status: 'permissionDenied' };

// The Android photo picker behind the gallery needs no permission; only the
// camera asks for one at runtime.
export async function pickImage(
  source: ImageSource,
  multiple = false,
): Promise<PickResult> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'permissionDenied' };
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: 'images' })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsMultipleSelection: multiple,
        });

  return result.canceled
    ? { status: 'cancelled' }
    : { status: 'picked', uris: result.assets.map((asset) => asset.uri) };
}
