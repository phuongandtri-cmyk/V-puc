import { OutfitSprite, spriteUrl } from '../../data/outfitSprites';

// Cache for fetched ImageBitmaps per file URL
const bitmapCache = new Map<string, Promise<ImageBitmap>>();

async function loadBitmap(url: string): Promise<ImageBitmap> {
  let promise = bitmapCache.get(url);
  if (!promise) {
    promise = (async () => {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) {
        throw new Error(`Failed to fetch sprite image: ${url} (status ${res.status})`);
      }
      const blob = await res.blob();
      return await createImageBitmap(blob);
    })();
    bitmapCache.set(url, promise);
  }
  return promise;
}

function parseHex(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Cache for flattened sprite PNG data URLs (max 24 entries)
const flattenCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 24;

/**
 * Composites a sprite's shade, fabric mask, and skin mask into a single PNG data URL.
 * Matches on-screen SVG multiply rendering exactly, without external images or SVG masks.
 */
export async function flattenSprite(
  sprite: OutfitSprite,
  fabricColor: string,
  skinColor: string,
  patternId?: string
): Promise<string> {
  const cacheKey = `${sprite.file}|${fabricColor}|${skinColor}|${patternId || ''}`;
  const cached = flattenCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [shadeBitmap, fabricMaskBitmap, skinMaskBitmap] = await Promise.all([
    loadBitmap(spriteUrl(sprite.file)),
    loadBitmap(spriteUrl(sprite.fabricMask)),
    loadBitmap(spriteUrl(sprite.skinMask)),
  ]);

  const W = sprite.width;
  const H = sprite.height;

  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = W;
  baseCanvas.height = H;
  const ctx = baseCanvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D canvas context for flattenSprite');

  // 1. Draw shade onto the base canvas
  ctx.drawImage(shadeBitmap, 0, 0);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = W;
  tempCanvas.height = H;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Cannot get temp 2D canvas context for flattenSprite');

  // 2. For fabric: read fabric mask pixels, build layer filled with fabricColor (alpha = mask strength), multiply
  tempCtx.clearRect(0, 0, W, H);
  tempCtx.drawImage(fabricMaskBitmap, 0, 0);
  const fabricMaskData = tempCtx.getImageData(0, 0, W, H);
  const fPixels = fabricMaskData.data;

  const [fR, fG, fB] = parseHex(fabricColor);
  const fabricColorData = tempCtx.createImageData(W, H);
  const fcPixels = fabricColorData.data;

  for (let i = 0; i < fPixels.length; i += 4) {
    const r = fPixels[i];
    const g = fPixels[i + 1];
    const b = fPixels[i + 2];
    const a = fPixels[i + 3];
    const maskStrength = ((r + g + b) / 3 / 255) * (a / 255);
    fcPixels[i] = fR;
    fcPixels[i + 1] = fG;
    fcPixels[i + 2] = fB;
    fcPixels[i + 3] = Math.round(maskStrength * 255);
  }

  tempCtx.putImageData(fabricColorData, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(tempCanvas, 0, 0);

  // 3. Same for skin with skinColor
  tempCtx.clearRect(0, 0, W, H);
  tempCtx.drawImage(skinMaskBitmap, 0, 0);
  const skinMaskData = tempCtx.getImageData(0, 0, W, H);
  const sPixels = skinMaskData.data;

  const [sR, sG, sB] = parseHex(skinColor);
  const skinColorData = tempCtx.createImageData(W, H);
  const scPixels = skinColorData.data;

  for (let i = 0; i < sPixels.length; i += 4) {
    const r = sPixels[i];
    const g = sPixels[i + 1];
    const b = sPixels[i + 2];
    const a = sPixels[i + 3];
    const maskStrength = ((r + g + b) / 3 / 255) * (a / 255);
    scPixels[i] = sR;
    scPixels[i + 1] = sG;
    scPixels[i + 2] = sB;
    scPixels[i + 3] = Math.round(maskStrength * 255);
  }

  tempCtx.putImageData(skinColorData, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(tempCanvas, 0, 0);

  // 4. Restore the sprite silhouette: globalCompositeOperation = 'destination-in'
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(shadeBitmap, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  // 5. Composite overlays if any (e.g. Bổ tử)
  if (sprite.overlays && patternId && sprite.overlays[patternId]) {
    const overlay = sprite.overlays[patternId];
    try {
      const overlayBitmap = await loadBitmap(spriteUrl(overlay.file));
      ctx.drawImage(overlayBitmap, overlay.x, overlay.y, overlay.width, overlay.height);
    } catch (e) {
      console.warn('[flattenSprite] Failed to load overlay:', overlay.file, e);
    }
  }

  const dataUrl = baseCanvas.toDataURL('image/png');

  // Maintain cache size <= MAX_CACHE_ENTRIES
  if (flattenCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = flattenCache.keys().next().value;
    if (oldestKey) flattenCache.delete(oldestKey);
  }
  flattenCache.set(cacheKey, dataUrl);

  return dataUrl;
}
