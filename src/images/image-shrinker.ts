import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { JPEG_QUALITY, resizeTarget } from './image-size';

// Writes the downscaled copy to the cache and returns its uri; the source stays.
export async function shrinkImage(uri: string): Promise<string> {
  // The contexts and images stay referenced until the save ends: the native
  // task is cancelled when a context is garbage collected mid-render.
  const loadContext = ImageManipulator.manipulate(uri);
  const original = await loadContext.renderAsync();
  const target = resizeTarget(original.width, original.height);
  const resizeContext = target
    ? ImageManipulator.manipulate(original).resize(target)
    : null;
  const scaled = resizeContext ? await resizeContext.renderAsync() : original;
  try {
    const saved = await scaled.saveAsync({
      format: SaveFormat.JPEG,
      compress: JPEG_QUALITY,
    });
    return saved.uri;
  } finally {
    if (scaled !== original) scaled.release();
    original.release();
    resizeContext?.release();
    loadContext.release();
  }
}
