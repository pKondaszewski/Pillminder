export const IMAGE_ROLES = ['box', 'pill', 'document'] as const;

export type ImageRole = (typeof IMAGE_ROLES)[number];

export const DEFAULT_IMAGE_ROLE: ImageRole = 'box';
