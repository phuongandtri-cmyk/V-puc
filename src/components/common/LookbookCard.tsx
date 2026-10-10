import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChibiFigure } from '../character/ChibiFigure';
import { WoodblockStamp } from './WoodblockStamp';
import { landmarks, landmarkUrl, Landmark } from '../../../data/landmarks';
import { FACE_FIT } from '../../config/faceFit';

export const FRAME_COLORS = [
  { id: 'dong-ho-do-son', name: 'Đỏ chu sa sơn', hex: '#D9442B', textColor: '#FFFFFF' },
  { id: 'dong-ho-vang-hoe', name: 'Vàng nắng hoè', hex: '#E9B824', textColor: '#1E1B18' },
  { id: 'dong-ho-xanh-cham', name: 'Xanh lá chàm', hex: '#2F4A7A', textColor: '#FFFFFF' },
  { id: 'hoang-thanh-pop', name: 'Hoàng thành pop', hex: '#5A5148', textColor: '#FFFFFF' },
];

export interface LookbookCardProps {
  className?: string;
  style?: React.CSSProperties;
  cardRef?: React.Ref<HTMLDivElement>;
  viewMode?: 'remix' | 'compare';
  allowRealFace?: boolean;
}

export const LookbookCard: React.FC<LookbookCardProps> = ({
  className = '',
  style,
  cardRef,
  viewMode = 'remix',
  allowRealFace = false,
}) => {
  const {
    character,
    outfit,
    cultureEvaluation,
    photoboothConfig,
    updatePhotoboothConfig,
    casualSnapshot,
  } = useApp();

  const [bgImageError, setBgImageError] = useState(false);

  // Landmark fallback: only landmarks from landmarks.ts are valid, else 'nen-tron'
  const validLandmarkIds = new Set(landmarks.map((l) => l.id));
  const rawLandmarkId = photoboothConfig.landmarkId || 'hoang-thanh-hue';
  const currentLandmarkId =
    rawLandmarkId === 'nen-tron' || validLandmarkIds.has(rawLandmarkId)
      ? rawLandmarkId
      : 'nen-tron';

  const isPlainBg = currentLandmarkId === 'nen-tron';
  const selectedLandmark: Landmark | undefined = isPlainBg
    ? undefined
    : landmarks.find((l) => l.id === currentLandmarkId);

  // groundY and charHeight sizing & placement
  const groundY = selectedLandmark ? selectedLandmark.groundY : 0.92;
  const charHeight = selectedLandmark ? selectedLandmark.charHeight : 0.62;

  // Reset bg error on landmark change
  useEffect(() => {
    setBgImageError(false);
  }, [currentLandmarkId]);

  // Frame Color selection
  const currentFrameColorHex =
    photoboothConfig.frameColor ||
    FRAME_COLORS.find((f) => f.id === photoboothConfig.bgTheme)?.hex ||
    '#D9442B';

  const activeFrameOption =
    FRAME_COLORS.find((f) => f.hex === currentFrameColorHex) || FRAME_COLORS[0];

  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  // Real face allowed ONLY when allowRealFace is true (Step 4) AND faceCutout exists AND useRealFace is true
  const canShowRealFace =
    allowRealFace &&
    Boolean(photoboothConfig.faceCutout) &&
    photoboothConfig.useRealFace !== false;

  const effectiveFaceImage = canShowRealFace ? photoboothConfig.faceCutout : undefined;

  // Photo skin applied ONLY together with the real face in step 4. Everywhere else use the step-1 skin tone.
  const effectiveSkinTone =
    canShowRealFace &&
    photoboothConfig.applyPhotoSkin !== false &&
    photoboothConfig.faceCutout?.skinHex
      ? photoboothConfig.faceCutout.skinHex
      : character.skinTone;

  return (
    <div
      ref={cardRef}
      id="lookbook-card"
      data-lookbook-card="true"
      className={`w-full flex flex-col justify-between relative overflow-hidden rounded-lg shadow-[3px_3px_0_#1E1B18] ${className}`}
      style={{
        boxSizing: 'border-box',
        borderColor: currentFrameColorHex,
        borderWidth: '12px',
        borderStyle: 'solid',
        backgroundColor: '#FFFDF7',
        ...style,
      }}
    >
      {/* Overlapping rotated culture guard stamp in top-right corner of stage */}
      <div className="absolute top-2 right-2 z-20 pointer-events-none whitespace-nowrap shrink-0">
        <WoodblockStamp
          text={cultureEvaluation.label}
          subtext="Culture Guard"
          variant={
            cultureEvaluation.level === 'xanh'
              ? 'green'
              : cultureEvaluation.level === 'vang'
              ? 'yellow'
              : 'red'
          }
          size="sm"
          rotation={4}
        />
      </div>

      {/* Header strip with selected frame color */}
      <div
        className="w-full flex justify-between items-center text-[10px] font-mono font-bold px-3 py-2 min-h-[30px] leading-snug shrink-0 z-10"
        style={{
          backgroundColor: currentFrameColorHex,
          color: activeFrameOption.textColor,
        }}
      >
        <span className="leading-normal tracking-wide inline-block">VIỆT PHỤC REMIX</span>
        <span className="truncate max-w-[140px] leading-normal">{character.name || 'Nhân vật'}</span>
      </div>

      {/* Stage Background & Character Preview: aspect-ratio 4/5, overflow:hidden */}
      <div className="w-full flex-1 relative overflow-hidden flex items-center justify-center p-2">
        <div
          className="relative overflow-hidden w-full max-h-full rounded-xs shadow-inner"
          style={{
            aspectRatio: '4 / 5',
            backgroundColor: isPlainBg ? '#F4EBD9' : '#FFFDF7',
          }}
        >
          {/* Landmark chibi background (object-cover, center bottom) */}
          {selectedLandmark && !isPlainBg && !bgImageError ? (
            <img
              src={landmarkUrl(selectedLandmark.chibiBg)}
              alt={selectedLandmark.ten}
              crossOrigin="anonymous"
              onError={() => setBgImageError(true)}
              className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
            />
          ) : (
            <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A5148] bg-[#F4EBD9]/85 px-2 py-0.5 border border-[#1E1B18]/30 rounded-xs shadow-xs">
                NỀN TRƠN
              </span>
            </div>
          )}

          {viewMode === 'compare' ? (
            /* Compare mode: Thường ngày vs Cổ phục Remix */
            <div className="absolute inset-0 z-10 flex items-center justify-around px-2">
              <div
                className="flex flex-col items-center justify-end"
                style={{
                  height: `calc(${charHeight * 0.9} * 100%)`,
                  bottom: `calc(${1 - groundY} * 100%)`,
                  position: 'absolute',
                  left: '28%',
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-[9px] font-mono font-bold bg-[#DCE4F0] px-1.5 py-0.5 border border-[#1E1B18] mb-1">
                  Thường ngày
                </span>
                <ChibiFigure
                  character={{
                    ...(casualSnapshot || character),
                    skinTone: effectiveSkinTone,
                  }}
                  skinTone={effectiveSkinTone}
                  outfit="casual"
                  faceImage={effectiveFaceImage}
                  paintFilter={photoboothConfig.paintFilterEnabled !== false}
                  renderMode="flat"
                  fit="content"
                  style={{ height: '100%', width: 'auto', display: 'block' }}
                />
                <div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: 0,
                    left: '50%',
                    width: '60%',
                    height: '8px',
                    transform: 'translate(-50%, 50%)',
                    background: 'rgba(0,0,0,0.18)',
                    borderRadius: '50%',
                  }}
                />
              </div>
              <div
                className="flex flex-col items-center justify-end"
                style={{
                  height: `calc(${charHeight * 0.9} * 100%)`,
                  bottom: `calc(${1 - groundY} * 100%)`,
                  position: 'absolute',
                  left: '72%',
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-[9px] font-mono font-bold bg-[#E9B824] px-1.5 py-0.5 border border-[#1E1B18] mb-1">
                  Cổ phục Remix
                </span>
                <ChibiFigure
                  character={{
                    ...character,
                    skinTone: effectiveSkinTone,
                  }}
                  skinTone={effectiveSkinTone}
                  outfit={outfit.garmentId}
                  colorHex={outfit.primaryColor}
                  colorId={outfit.colorId}
                  accessories={outfit.accessories}
                  faceImage={effectiveFaceImage}
                  paintFilter={photoboothConfig.paintFilterEnabled !== false}
                  renderMode="flat"
                  fit="content"
                  style={{ height: '100%', width: 'auto', display: 'block' }}
                />
                <div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: 0,
                    left: '50%',
                    width: '60%',
                    height: '8px',
                    transform: 'translate(-50%, 50%)',
                    background: 'rgba(0,0,0,0.18)',
                    borderRadius: '50%',
                  }}
                />
              </div>
            </div>
          ) : (
            /* Character wrapper placed with groundY & charHeight */
            <div
              className="absolute pointer-events-none z-10 flex flex-col items-center justify-end"
              style={{
                height: `calc(${charHeight} * 100%)`,
                bottom: `calc(${1 - groundY} * 100%)`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {/* Character SVG with fit="content" */}
              <ChibiFigure
                character={{
                  ...character,
                  skinTone: effectiveSkinTone,
                }}
                skinTone={effectiveSkinTone}
                outfit={outfit.garmentId}
                colorHex={outfit.primaryColor}
                colorId={outfit.colorId}
                accessories={outfit.accessories}
                faceImage={effectiveFaceImage}
                paintFilter={photoboothConfig.paintFilterEnabled !== false}
                renderMode="flat"
                fit="content"
                style={{
                  height: '100%',
                  width: 'auto',
                  display: 'block',
                }}
              />

              {/* Floor shadow ellipse under the feet */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: 0,
                  left: '50%',
                  width: '60%',
                  height: '3cqi',
                  minHeight: '6px',
                  maxHeight: '12px',
                  transform: 'translate(-50%, 50%)',
                  background: 'rgba(0,0,0,0.18)',
                  borderRadius: '50%',
                }}
              />
            </div>
          )}

          {/* Debug Aid: groundY & charHeight label and face fit info (?debug=1) */}
          {isDebug && (
            <div data-debug-overlay="true" className="absolute bottom-1.5 left-1.5 z-30 bg-[#1E1B18]/85 text-[#FFFDF7] px-1.5 py-0.5 rounded font-mono text-[9px] pointer-events-none flex flex-col gap-0.5">
              <span>groundY={groundY} charHeight={charHeight}</span>
              {effectiveFaceImage && (() => {
                const R = 90;
                const chinY = 260;
                const isFem = character.gender === 'nu';
                const style = character.hairStyle;
                const fringeY = (() => {
                  switch (style) {
                    case 'bui-thap-truyen-thong': return 118;
                    case 'van-toc-cai-tram': return 120;
                    case 'bui-cao-cung-dinh': return 120;
                    case 'toc-dai-co-dien': return 120;
                    case 'textured-quiff': return 114;
                    case 'messy-fringe': return 150;
                    case 'half-up-bun': return 142;
                    case 'low-ponytail': return 118;
                    default: return isFem ? 120 : 120;
                  }
                })();
                const W = 2 * FACE_FIT.sideInset * R * FACE_FIT.fill;
                const T = fringeY - FACE_FIT.topOverlap * R;
                const B = chinY - FACE_FIT.chinInset * R;
                let H = (B - T) * FACE_FIT.fill;
                const photoW = effectiveFaceImage.photoFaceBoxWidth || 1;
                const photoH = effectiveFaceImage.photoFaceBoxHeight || 1.25;
                const naturalH = W * (photoH / photoW);
                if (H < naturalH * FACE_FIT.maxSquash) {
                  H = naturalH * FACE_FIT.maxSquash;
                }
                const squash = (H / naturalH).toFixed(2);
                return (
                  <span className="text-[#FF00FF]">
                    W={W.toFixed(1)}, H={H.toFixed(1)}, T={T.toFixed(1)}, B={B.toFixed(1)}, squash={squash}
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Live Caption strip */}
      <div className="w-full text-center py-1.5 px-2 bg-[#FFFDF7]/95 border-t border-[#1E1B18]/20 shrink-0 z-10">
        <p className="text-xs font-display font-bold text-[#1E1B18] italic truncate">
          "{photoboothConfig.caption || 'Hồn Cổ Phục Trong Nhịp Thở Phố'}"
        </p>
      </div>
    </div>
  );
};
