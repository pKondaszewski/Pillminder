import * as ImagePicker from 'expo-image-picker';

import { createLogger } from '@/config/logger';

import type { ImageSource } from './dto/image-source';
import { shrinkImage } from './image-shrinker';

const log = createLogger('image-picker');

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

  if (result.canceled) return { status: 'cancelled' };
  const uris: string[] = [];
  for (const asset of result.assets) uris.push(await shrinkOrKeep(asset.uri));
  return { status: 'picked', uris };
}

// A photo that cannot be shrunk is still better than no photo
async function shrinkOrKeep(uri: string): Promise<string> {
  try {
    return await shrinkImage(uri);
  } catch (err) {
    log.error('Failed to shrink a picked image, keeping the original', err);
    return uri;
  }
}
