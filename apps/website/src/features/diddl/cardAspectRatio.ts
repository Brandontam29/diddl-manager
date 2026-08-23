import type { DiddlCardItem } from "./cardItems";

/**
 * Width / height used for a card whose Catalog entry has no image dimensions.
 * Issue #37: the median ratio over the 3,800 entries with dimensions is 0.698, so a
 * portrait 0.7 gives the 113 dimensionless entries a normal-looking tile instead of
 * the collapsed card the desktop renders.
 */
export const FALLBACK_CARD_ASPECT_RATIO = 0.7;

export const cardAspectRatio = (item: Pick<DiddlCardItem, "imageWidth" | "imageHeight">) =>
  item.imageWidth && item.imageHeight
    ? item.imageWidth / item.imageHeight
    : FALLBACK_CARD_ASPECT_RATIO;
