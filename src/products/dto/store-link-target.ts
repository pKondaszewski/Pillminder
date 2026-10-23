export const STORE_LINK_TARGETS = ['maps', 'web'] as const;

export type StoreLinkTarget = (typeof STORE_LINK_TARGETS)[number];
