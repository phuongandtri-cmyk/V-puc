import { outfitSprites, OutfitSprite, spriteUrl } from '../../data/outfitSprites';

// Module-level Set to remember loaded image URLs
export const loadedSpriteUrls = new Set<string>();

// Preload a single image URL and mark as loaded only after decode() (or onload fallback)
export function preloadSingleImage(url: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (loadedSpriteUrls.has(url)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const img = new Image();
    const markLoaded = () => {
      loadedSpriteUrls.add(url);
      resolve();
    };

    img.onload = () => {
      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(markLoaded)
          .catch(() => {
            // Fallback to marking loaded if decode rejects
            markLoaded();
          });
      } else {
        markLoaded();
      }
    };

    img.onerror = () => {
      // Resolve on error so callers are not hung
      resolve();
    };

    img.src = url;
  });
}

// Preload a single image URL into cache and track in loadedSpriteUrls
export function preloadImageUrl(url: string, onLoaded?: () => void): void {
  preloadSingleImage(url).then(() => {
    onLoaded?.();
  });
}

// Check if all images needed for a sprite (and optional pattern overlay) are already loaded
export function isSpriteFullyLoaded(sprite: OutfitSprite, patternId?: string): boolean {
  if (typeof window === 'undefined') return true;
  const urls: string[] = [
    spriteUrl(sprite.file),
    spriteUrl(sprite.fabricMask),
    spriteUrl(sprite.skinMask),
  ];
  if (patternId && sprite.overlays?.[patternId]) {
    urls.push(spriteUrl(sprite.overlays[patternId].file));
  }
  return urls.every((u) => loadedSpriteUrls.has(u));
}

// Preload all images for a specific sprite and call onAllLoaded when all finish
export function preloadSpriteImages(
  sprite: OutfitSprite,
  patternId?: string,
  onAllLoaded?: () => void
): void {
  if (typeof window === 'undefined') {
    onAllLoaded?.();
    return;
  }

  const urls: string[] = [
    spriteUrl(sprite.file),
    spriteUrl(sprite.fabricMask),
    spriteUrl(sprite.skinMask),
  ];
  if (patternId && sprite.overlays?.[patternId]) {
    urls.push(spriteUrl(sprite.overlays[patternId].file));
  }

  const pending = urls.filter((u) => !loadedSpriteUrls.has(u));
  if (pending.length === 0) {
    onAllLoaded?.();
    return;
  }

  Promise.all(pending.map(preloadSingleImage)).then(() => {
    onAllLoaded?.();
  });
}

// Preload every image referenced across all outfits on app start
export function preloadAllOutfitSprites(): void {
  if (typeof window === 'undefined') return;

  for (const outfitKey of Object.keys(outfitSprites)) {
    const genders = outfitSprites[outfitKey];
    if (!genders) continue;

    for (const genderKey of ['nam', 'nu'] as const) {
      const sprite = genders[genderKey];
      if (!sprite) continue;

      preloadImageUrl(spriteUrl(sprite.file));
      preloadImageUrl(spriteUrl(sprite.fabricMask));
      preloadImageUrl(spriteUrl(sprite.skinMask));

      if (sprite.overlays) {
        for (const overlay of Object.values(sprite.overlays)) {
          if (overlay?.file) {
            preloadImageUrl(spriteUrl(overlay.file));
          }
        }
      }
    }
  }
}

// Auto-run on startup in browser environment
if (typeof window !== 'undefined') {
  preloadAllOutfitSprites();
}
