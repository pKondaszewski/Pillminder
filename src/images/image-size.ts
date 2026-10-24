export const JPEG_QUALITY = 0.8;

// Fills the 1440 px wide test phone screen 1:1 with a 3:4 portrait photo.
const MAX_SIDE_PX = 1920;

// Above what a shrunk 1920 px JPEG weighs, so shrunk files are skipped.
const SHRINK_THRESHOLD_BYTES = 2 * 1024 * 1024;

export type ResizeTarget = { width: number } | { height: number };

export function resizeTarget(
  width: number,
  height: number,
): ResizeTarget | null {
  if (Math.max(width, height) <= MAX_SIDE_PX) return null;
  return width >= height ? { width: MAX_SIDE_PX } : { height: MAX_SIDE_PX };
}

export function needsShrinking(sizeInBytes: number): boolean {
  return sizeInBytes >= SHRINK_THRESHOLD_BYTES;
}
