export const IMAGE_ROLES = ['box', 'pill', 'document'] as const;

export type ImageRole = (typeof IMAGE_ROLES)[number];
