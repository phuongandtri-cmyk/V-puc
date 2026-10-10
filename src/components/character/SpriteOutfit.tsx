import React, { useId, useState, useEffect, useRef } from 'react';
import { OutfitSprite, spriteUrl } from '../../../data/outfitSprites';
import { KiengCoSprite, TuiToteSprite } from './CharacterAccessories';
import { flattenSprite } from '../../lib/flattenSprite';

export interface SpriteOutfitProps {
  sprite: OutfitSprite;
  appFaceCx: number;
  appFaceCy: number;
  appFaceR: number;
  scaleX: number;
  scaleY: number;
  fabricColor: string;
  skinColor: string;
  patternId?: string;
  hasKiengCo?: boolean;
  hasTuiTote?: boolean;
  renderMode?: 'live' | 'flat';
  onReady?: () => void;
  onError?: () => void;
}

export const SpriteOutfit: React.FC<SpriteOutfitProps> = ({
  sprite,
  appFaceCx,
  appFaceCy,
  appFaceR,
  scaleX,
  scaleY,
  fabricColor,
  skinColor,
  patternId,
  hasKiengCo,
  hasTuiTote,
  renderMode = 'live',
  onReady,
  onError,
}) => {
  const uid = useId().replace(/:/g, '');
  const fabId = `sprite-fab-${uid}`;
  const skinId = `sprite-skin-${uid}`;

  const [hasError, setHasError] = useState(false);
  const [flatUrl, setFlatUrl] = useState<string | null>(null);
  const [isFlatReady, setIsFlatReady] = useState(false);
  const reqIdRef = useRef(0);

  const handleError = () => {
    setHasError(true);
    if (onError) {
      setTimeout(() => onError(), 0);
    }
  };

  useEffect(() => {
    if (renderMode !== 'flat') {
      setIsFlatReady(true);
      onReady?.();
      return;
    }

    let isCancelled = false;
    const currentReq = ++reqIdRef.current;

    flattenSprite(sprite, fabricColor, skinColor, patternId)
      .then((dataUrl) => {
        if (!isCancelled && reqIdRef.current === currentReq) {
          setFlatUrl(dataUrl);
          setIsFlatReady(true);
          onReady?.();
        }
      })
      .catch((err) => {
        console.error('[SpriteOutfit] Failed to flatten sprite:', err);
        handleError();
      });

    return () => {
      isCancelled = true;
    };
  }, [renderMode, sprite, fabricColor, skinColor, patternId]);

  if (hasError) return null;

  const W = sprite.width;
  const H = sprite.height;

  // Coordinate math
  const s = appFaceR / sprite.face.r;
  const tx = appFaceCx - sprite.face.cx * s;
  const ty = appFaceCy - sprite.face.cy * s;

  // Neck origin for height/weight outer scaling
  const ox = appFaceCx;
  const oy = appFaceCy + (sprite.neckY - sprite.face.cy) * s;

  const isReady = renderMode === 'flat' ? isFlatReady && Boolean(flatUrl) : true;

  return (
    <>
      {renderMode === 'live' && (
        <defs>
          <mask id={fabId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <image
              href={spriteUrl(sprite.fabricMask)}
              x={0}
              y={0}
              width={W}
              height={H}
              preserveAspectRatio="none"
              onError={handleError}
            />
          </mask>
          <mask id={skinId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <image
              href={spriteUrl(sprite.skinMask)}
              x={0}
              y={0}
              width={W}
              height={H}
              preserveAspectRatio="none"
              onError={handleError}
            />
          </mask>
        </defs>
      )}

      <g
        data-part="sprite-outfit"
        data-sprite-ready={isReady ? 'true' : 'false'}
        transform={`translate(${ox} ${oy}) scale(${scaleX} ${scaleY}) translate(${-ox} ${-oy})`}
      >
        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          {renderMode === 'flat' ? (
            flatUrl && (
              <image
                href={flatUrl}
                x={0}
                y={0}
                width={W}
                height={H}
                preserveAspectRatio="none"
              />
            )
          ) : (
            <g style={{ isolation: 'isolate' }}>
              <image
                href={spriteUrl(sprite.file)}
                x={0}
                y={0}
                width={W}
                height={H}
                preserveAspectRatio="none"
                onError={handleError}
              />
              <rect
                x={0}
                y={0}
                width={W}
                height={H}
                fill={fabricColor}
                mask={`url(#${fabId})`}
                style={{ mixBlendMode: 'multiply' }}
              />
              <rect
                x={0}
                y={0}
                width={W}
                height={H}
                fill={skinColor}
                mask={`url(#${skinId})`}
                style={{ mixBlendMode: 'multiply' }}
              />
            </g>
          )}

          {/* Kiềng cổ (inside sprite pixels, follows body stretch) */}
          {hasKiengCo && <KiengCoSprite sprite={sprite} />}

          {/* Túi tote (hanging from sprite.hands.viewerRight) */}
          {hasTuiTote && <TuiToteSprite sprite={sprite} />}
        </g>
      </g>
    </>
  );
};
