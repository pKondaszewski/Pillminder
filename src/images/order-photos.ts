import type { ProductImage } from './image-repository';

export function orderPhotos(
  images: ProductImage[],
  profileImageId: string | null,
): ProductImage[] {
  const byAge = [...images].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const profile = byAge.find((image) => image.id === profileImageId);
  return profile
    ? [profile, ...byAge.filter((image) => image !== profile)]
    : byAge;
}
