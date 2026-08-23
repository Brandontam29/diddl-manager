/**
 * Catalog images live under `VITE_IMAGE_BASE_URL` (`/diddls` on Vercel's CDN, spec §7)
 * and the Catalog stores relative forward-slash paths. An empty path (561 entries have
 * no image, issue #37) yields `undefined` so the Kobalte fallback takes over.
 */
export const imageUrl = (imagePath: string | null | undefined): string | undefined => {
  if (!imagePath) return undefined;

  const base = (import.meta.env.VITE_IMAGE_BASE_URL ?? "/diddls").replace(/\/$/, "");
  return `${base}/${imagePath.replaceAll("\\", "/").replace(/^\//, "")}`;
};
