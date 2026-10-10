import React, { useId } from 'react';
import './ChibiFigure.css';
import { CharacterConfig, Gender, HairStyle, Expression, FaceCutoutData } from '../../types';
import { FACE_FIT } from '../../config/faceFit';
import {
  MaleHairBack,
  MaleHairFront,
  MALE_HAIRSTYLE_OPTIONS,
  DEFAULT_MALE_HAIR,
  normalizeMaleHairId,
} from './MaleHair';
import {
  FemaleHairBack,
  FemaleHairFront,
  FEMALE_HAIRSTYLE_OPTIONS,
  DEFAULT_FEMALE_HAIR,
  normalizeFemaleHairId,
} from './FemaleHair';
import { colors } from '../../data/stylingOptions';
import { outfitSprites, OutfitSprite } from '../../../data/outfitSprites';
import { SpriteOutfit } from './SpriteOutfit';
import {
  isSpriteFullyLoaded,
  preloadSpriteImages,
} from '../../services/spritePreloader';
import { AppContext } from '../../context/AppContext';
import { OutfitAccessoriesConfig } from '../../types';
import {
  KhanXep,
  KhanMoQua,
  NonQuaiThao,
  KhanRan,
  KinhRam,
  KiengCoSvg,
  TuiToteSvg,
} from './CharacterAccessories';

export interface ChibiFigureProps {
  character?: CharacterConfig;
  gender?: Gender | 'male' | 'female';
  heightCm?: number;
  weightKg?: number;
  skinTone?: string;
  hairStyle?: HairStyle | string;
  hairColor?: string;
  expression?: Expression | string;
  outfit?: string;
  colorHex?: string;
  colorId?: string;
  patternId?: string;
  accessories?: OutfitAccessoriesConfig | string[];
  showChinLine?: boolean;
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  fit?: 'default' | 'content';
  faceCutout?: FaceCutoutData | null;
  faceImage?: FaceCutoutData | null;
  paintFilter?: boolean;
  renderMode?: 'live' | 'flat';
}

function darkenHex(hex: string, percent: number): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return '#1E1B18';
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.max(0, Math.min(255, Math.round(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 - percent))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function resolveGarmentColor(outfitId: string, customHex?: string, customColorId?: string) {
  let fill = customHex;
  if (!fill && customColorId) {
    const found = colors.find((c) => c.id === customColorId);
    if (found) fill = found.hex;
  }
  if (!fill) {
    const match = colors.find((c) => c.truyenThongCho.includes(outfitId));
    if (match) {
      fill = match.hex;
    } else {
      const xanhCham = colors.find((c) => c.id === 'xanh-cham');
      fill = xanhCham ? xanhCham.hex : '#2F4A7A';
    }
  }
  return {
    fill,
    shadow: darkenHex(fill, 0.15),
  };
}

export const ChibiFigure: React.FC<ChibiFigureProps> = ({
  character,
  gender,
  heightCm,
  weightKg,
  skinTone,
  hairStyle,
  hairColor,
  expression,
  outfit = 'casual',
  colorHex,
  colorId,
  patternId,
  accessories,
  showChinLine = false,
  className = '',
  size = 320,
  width,
  height,
  style,
  fit = 'default',
  faceImage: propFaceImage,
  faceCutout: propFaceCutout,
  paintFilter = false,
  renderMode = 'live',
}) => {
  const uid = useId().replace(/:/g, '');

  const figureGroupRef = React.useRef<SVGGElement>(null);
  const [contentViewBox, setContentViewBox] = React.useState<string | null>(null);

  const appContext = React.useContext(AppContext);

  // Target values from props / context
  const targetGender: 'nam' | 'nu' =
    (character?.gender ?? gender ?? 'nam') === 'nu' ? 'nu' : 'nam';
  const targetIsFemale = targetGender === 'nu';
  const targetHeight = character?.heightCm ?? character?.height ?? heightCm ?? 165;
  const targetWeight = character?.weightKg ?? character?.weight ?? weightKg ?? 54;
  const targetSkinTone = character?.skinTone ?? skinTone ?? '#FFE7D1';
  const targetHairStyle = targetIsFemale
    ? normalizeFemaleHairId(character?.hairStyle ?? hairStyle)
    : normalizeMaleHairId(character?.hairStyle ?? hairStyle);
  const targetHairColor = character?.hairColor ?? hairColor ?? '#1E1B18';
  const targetExpression = character?.expression ?? expression ?? 'vui';
  const targetOutfitId = outfit || 'casual';

  const effectiveAccessories =
    targetOutfitId === 'casual' && !accessories
      ? undefined
      : (accessories ?? appContext?.outfit?.accessories);

  // Garment color resolution
  const isMauGoc = !colorId || colorId === 'mau-goc';
  const garmentColor = isMauGoc
    ? resolveGarmentColor(targetOutfitId)
    : resolveGarmentColor(targetOutfitId, colorHex, colorId);

  const targetSprite = outfitSprites[targetOutfitId]?.[targetGender];
  const targetFabricColor = targetSprite
    ? (isMauGoc ? targetSprite.defaultFabric : (colorHex || garmentColor.fill))
    : garmentColor.fill;

  interface DisplayedLook {
    gender: 'nam' | 'nu';
    hairStyle: string;
    hairColor: string;
    skinTone: string;
    expression: string;
    heightCm: number;
    weightKg: number;
    outfitId: string;
    fabricColor: string;
    patternId?: string;
    accessories?: OutfitAccessoriesConfig | string[];
  }

  // ATOMIC SWAP: Single committed look state for head AND body
  const [displayedLook, setDisplayedLook] = React.useState<DisplayedLook>(() => ({
    gender: targetGender,
    hairStyle: targetHairStyle,
    hairColor: targetHairColor,
    skinTone: targetSkinTone,
    expression: targetExpression,
    heightCm: targetHeight,
    weightKg: targetWeight,
    outfitId: targetOutfitId,
    fabricColor: targetFabricColor,
    patternId,
    accessories: effectiveAccessories,
  }));

  const [spriteError, setSpriteError] = React.useState(false);
  const [popActive, setPopActive] = React.useState(false);
  const requestIdRef = React.useRef(0);

  // Reset sprite error when target outfit or gender changes
  React.useEffect(() => {
    setSpriteError(false);
  }, [targetOutfitId, targetGender]);

  // Synchronous sync when target is already fully loaded or SVG-only
  const isTargetAlreadyLoaded =
    !targetSprite || isSpriteFullyLoaded(targetSprite, patternId);

  if (
    isTargetAlreadyLoaded &&
    (displayedLook.gender !== targetGender ||
      displayedLook.outfitId !== targetOutfitId)
  ) {
    setDisplayedLook({
      gender: targetGender,
      hairStyle: targetHairStyle,
      hairColor: targetHairColor,
      skinTone: targetSkinTone,
      expression: targetExpression,
      heightCm: targetHeight,
      weightKg: targetWeight,
      outfitId: targetOutfitId,
      fabricColor: targetFabricColor,
      patternId,
      accessories: effectiveAccessories,
    });
  } else if (
    displayedLook.gender === targetGender &&
    displayedLook.outfitId === targetOutfitId
  ) {
    if (
      displayedLook.skinTone !== targetSkinTone ||
      displayedLook.hairColor !== targetHairColor ||
      displayedLook.hairStyle !== targetHairStyle ||
      displayedLook.expression !== targetExpression ||
      displayedLook.heightCm !== targetHeight ||
      displayedLook.weightKg !== targetWeight ||
      displayedLook.fabricColor !== targetFabricColor ||
      displayedLook.patternId !== patternId ||
      displayedLook.accessories !== effectiveAccessories
    ) {
      setDisplayedLook((prev) => ({
        ...prev,
        skinTone: targetSkinTone,
        hairColor: targetHairColor,
        hairStyle: targetHairStyle,
        expression: targetExpression,
        heightCm: targetHeight,
        weightKg: targetWeight,
        fabricColor: targetFabricColor,
        patternId,
        accessories: effectiveAccessories,
      }));
    }
  }

  // Preloading & race-guarded atomic commit when target sprite is not yet cached
  React.useEffect(() => {
    if (
      displayedLook.gender === targetGender &&
      displayedLook.outfitId === targetOutfitId
    ) {
      return;
    }

    if (!targetSprite || isSpriteFullyLoaded(targetSprite, patternId)) {
      setDisplayedLook({
        gender: targetGender,
        hairStyle: targetHairStyle,
        hairColor: targetHairColor,
        skinTone: targetSkinTone,
        expression: targetExpression,
        heightCm: targetHeight,
        weightKg: targetWeight,
        outfitId: targetOutfitId,
        fabricColor: targetFabricColor,
        patternId,
        accessories: effectiveAccessories,
      });
      setPopActive(true);
      const timer = setTimeout(() => setPopActive(false), 120);
      return () => clearTimeout(timer);
    }

    const currentToken = ++requestIdRef.current;
    preloadSpriteImages(targetSprite, patternId, () => {
      if (requestIdRef.current === currentToken) {
        setDisplayedLook({
          gender: targetGender,
          hairStyle: targetHairStyle,
          hairColor: targetHairColor,
          skinTone: targetSkinTone,
          expression: targetExpression,
          heightCm: targetHeight,
          weightKg: targetWeight,
          outfitId: targetOutfitId,
          fabricColor: targetFabricColor,
          patternId,
          accessories: effectiveAccessories,
        });
        setPopActive(true);
        setTimeout(() => setPopActive(false), 120);
      }
    });
  }, [
    targetGender,
    targetOutfitId,
    targetHairStyle,
    targetHairColor,
    targetSkinTone,
    targetExpression,
    targetHeight,
    targetWeight,
    targetFabricColor,
    patternId,
    effectiveAccessories,
    targetSprite,
    displayedLook.gender,
    displayedLook.outfitId,
  ]);

  // All character parts are strictly derived from the committed displayedLook
  const isFemale = displayedLook.gender === 'nu';
  const actualHeight = displayedLook.heightCm;
  const actualWeight = displayedLook.weightKg;
  const actualSkinTone = displayedLook.skinTone;
  const actualHairStyle = displayedLook.hairStyle;
  const actualHairColor = displayedLook.hairColor;
  const actualExpression = displayedLook.expression;
  const activeOutfitId = displayedLook.outfitId;
  const activeFabricColor = displayedLook.fabricColor;
  const activePatternId = undefined;
  const activeAccessories = effectiveAccessories;

  const selectedAccIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (!activeAccessories) return ids;
    if (Array.isArray(activeAccessories)) {
      activeAccessories.forEach((id) => {
        if (typeof id === 'string') ids.add(id);
      });
    } else if (typeof activeAccessories === 'object') {
      Object.values(activeAccessories).forEach((val) => {
        if (Array.isArray(val)) {
          val.forEach((id) => {
            if (typeof id === 'string') ids.add(id);
          });
        } else if (typeof val === 'string' && val) {
          ids.add(val);
        }
      });
    }
    return ids;
  }, [activeAccessories]);

  const hasKhanXep = selectedAccIds.has('khan-xep');
  const hasKhanMoQua = selectedAccIds.has('khan-mo-qua');
  const hasNonQuaiThao = selectedAccIds.has('non-quai-thao');
  const hasKhanRan = selectedAccIds.has('khan-ran');
  const hasKiengCo = selectedAccIds.has('kieng-co');
  const hasKinhRam = selectedAccIds.has('kinh-ram');
  const hasTuiTote = selectedAccIds.has('tui-tote');

  const activeSprite = spriteError
    ? undefined
    : outfitSprites[activeOutfitId]?.[displayedLook.gender];

  // Head coordinates (SVG units)
  const appFaceCx = 200;
  const appFaceCy = 172;
  const appFaceR = 90;

  // Step 5 Formulas
  const h = actualHeight / 165;
  const sT = 1 + (h - 1) * 0.5; // torso stretch
  const sL = 1 + (h - 1) * 2.2; // leg stretch
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const w = clamp((actualWeight - 54) / 41, -0.34, 1);
  const sX = 1 + w * 0.35; // width
  const d1 = 124 * (sT - 1); // extra torso length
  const d2 = 156 * (sL - 1); // extra leg length

  // Height stretch for full-length sprite from neck origin:
  const spriteScaleY = activeSprite
    ? (() => {
        const s = appFaceR / activeSprite.face.r;
        const spriteBodyH = (activeSprite.height - activeSprite.neckY) * s;
        return spriteBodyH > 0 ? (spriteBodyH + d1 + d2) / spriteBodyH : 1;
      })()
    : 1;

  const about = (cx: number, cy: number, a: number, b: number) =>
    `translate(${cx} ${cy}) scale(${a} ${b}) translate(${-cx} ${-cy})`;

  const renderFace = () => {
    // Eyelashes for female
    const femaleEyelashes = isFemale ? (
      <>
        <path className="cb-detail" d="M150 192 L143 186 M154 186 L149 180" />
        <path className="cb-detail" d="M250 192 L257 186 M246 186 L251 180" />
      </>
    ) : null;

    if (actualExpression === 'cool') {
      return (
        <>
          {/* Confident almond eyes */}
          <ellipse cx="164" cy="188" rx="8" ry="10" fill="#1E1B18" />
          <circle cx="161" cy="185" r="3" fill="#FFFDF7" />
          <ellipse cx="236" cy="188" rx="8" ry="10" fill="#1E1B18" />
          <circle cx="233" cy="185" r="3" fill="#FFFDF7" />
          <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="150" cy="212" rx="15" ry="8" />
          <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="250" cy="212" rx="15" ry="8" />
          {/* Confident smirk */}
          <path
            d="M190 224 Q204 226 212 219"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {femaleEyelashes}
        </>
      );
    }

    if (actualExpression === 'dang-yeu') {
      return (
        <>
          {/* Large sparkling eyes */}
          <circle cx="164" cy="188" r="11" fill="#1E1B18" />
          <circle cx="161" cy="184" r="4" fill="#FFFDF7" />
          <circle cx="168" cy="192" r="2" fill="#FFFDF7" />
          <circle cx="236" cy="188" r="11" fill="#1E1B18" />
          <circle cx="233" cy="184" r="4" fill="#FFFDF7" />
          <circle cx="240" cy="192" r="2" fill="#FFFDF7" />
          <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="150" cy="212" rx="15" ry="8" />
          <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="250" cy="212" rx="15" ry="8" />
          {/* Cute cat mouth :3 */}
          <path
            d="M190 220 Q195 226 200 220 Q205 226 210 220"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {femaleEyelashes}
        </>
      );
    }

    if (actualExpression === 'kieu-ky') {
      return (
        <>
          {/* Serene courtly eyes */}
          <path
            d="M152 187 C158 183 170 185 176 189"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="164" cy="189" r="4" fill="#1E1B18" />
          <path
            d="M224 189 C230 185 242 183 248 187"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="236" cy="189" r="4" fill="#1E1B18" />
          <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="150" cy="212" rx="15" ry="8" />
          <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="250" cy="212" rx="15" ry="8" />
          {/* Poised delicate lips */}
          <ellipse cx="200" cy="222" rx="6.5" ry="3.5" fill="#D9442B" stroke="#1E1B18" strokeWidth="1.8" />
          {femaleEyelashes}
        </>
      );
    }

    // Default 'vui' (Happy)
    return (
      <>
        <path
          className="cb-feature"
          fill="none"
          stroke="#1E1B18"
          strokeWidth="3.5"
          strokeLinecap="round"
          d="M150 192 Q164 178 178 192"
        />
        <path
          className="cb-feature"
          fill="none"
          stroke="#1E1B18"
          strokeWidth="3.5"
          strokeLinecap="round"
          d="M222 192 Q236 178 250 192"
        />
        <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="150" cy="212" rx="15" ry="8" />
        <ellipse className="cb-blush" fill="#F2A7A0" opacity="0.6" cx="250" cy="212" rx="15" ry="8" />
        <path
          className="cb-mouth cb-outline"
          fill="#D9442B"
          stroke="#1E1B18"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M186 216 Q200 234 214 216 Q200 220 186 216 Z"
        />
        {femaleEyelashes}
      </>
    );
  };

  const renderPatternOverlay = (_clipId: string) => null;

  const renderRankBadge = () => null;

  const renderLowerClothing = () => {
    if (outfit === 'casual') {
      return (
        <g
          data-part="pants"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {isFemale ? (
            <path
              className="cb-pants cb-outline"
              fill="#2F4A7A"
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M148 390 L252 390 Q258 420 259 440 L258 548 L203 548 L201 452 Q200 446 199 452 L197 548 L142 548 L141 440 Q142 420 148 390 Z"
            />
          ) : (
            <path
              className="cb-pants cb-outline"
              fill="#2F4A7A"
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M148 390 L252 390 Q254 420 255 440 L258 548 L203 548 L201 452 Q200 446 199 452 L197 548 L142 548 L145 440 Q146 420 148 390 Z"
            />
          )}
          <path className="cb-pants-shade" fill="#24395F" d="M198.5 458 L197 546 L190 546 Z" />
          <path className="cb-pants-shade" fill="#24395F" d="M201.5 458 L203 546 L210 546 Z" />
          <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M200 404 L200 446" />
          <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M200 418 Q190 424 186 412" />
          <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M171 412 L168 544" />
          <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M229 412 L232 544" />
        </g>
      );
    }

    if (outfit === 'giao-linh') {
      return (
        <g
          data-part="lower-giao-linh"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* Below hem: Male wide trousers #3A332E / Female long black skirt #2B2622 */}
          {isFemale ? (
            <path
              fill="#2B2622"
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M146 390 L254 390 Q262 470 268 548 L132 548 Q138 470 146 390 Z"
            />
          ) : (
            <path
              fill="#3A332E"
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M144 390 L256 390 L260 548 L204 548 L201 440 L199 440 L196 548 L140 548 Z"
            />
          )}

          {/* Robe hem at 65% of waist->ankle = 493, slight A-line */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L254 390 Q258 440 262 493 L138 493 Q142 440 146 390 Z"
          />
          {renderPatternOverlay(`clip-giao-linh-skirt-${uid}`)}
          {/* Slits */}
          <line x1="140" y1="472" x2="140" y2="493" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="260" y1="472" x2="260" y2="493" stroke="#1E1B18" strokeWidth="2.5" />
          {/* Drape folds */}
          <path d="M178 390 Q174 445 170 493" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          <path d="M222 390 Q226 445 230 493" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* Female silk sash hanging ends */}
          {isFemale && (
            <g>
              <path d="M166 390 L164 435" stroke="#E9B824" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M172 390 L174 430" stroke="#E9B824" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M166 390 L164 435 M172 390 L174 430" stroke="#1E1B18" strokeWidth="1" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>
      );
    }

    if (outfit === 'vien-linh') {
      return (
        <g
          data-part="lower-vien-linh"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* Male trousers #3A332E / Female black skirt #2B2622 */}
          {isFemale ? (
            <path
              fill="#2B2622"
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M146 390 L254 390 Q262 470 268 548 L132 548 Q138 470 146 390 Z"
            />
          ) : (
            <path
              fill="#3A332E"
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M144 390 L256 390 L260 548 L204 548 L201 440 L199 440 L196 548 L140 548 Z"
            />
          )}

          {/* Robe hem at 88% of waist->ankle = 529, wide body, side slits */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L254 390 Q262 460 268 529 L132 529 Q138 460 146 390 Z"
          />
          {renderPatternOverlay(`clip-vien-linh-skirt-${uid}`)}
          {/* Slits */}
          <line x1="134" y1="495" x2="134" y2="529" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="266" y1="495" x2="266" y2="529" stroke="#1E1B18" strokeWidth="2.5" />
          <path d="M174 390 Q170 460 166 529" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          <path d="M226 390 Q230 460 234 529" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
        </g>
      );
    }

    if (outfit === 'ngu-than-lap-co') {
      return (
        <g
          data-part="lower-ngu-than"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* White trousers #FBF7EE to ankle (both genders) */}
          <path
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M144 390 L256 390 L258 548 L203 548 L201 450 L199 450 L197 548 L142 548 Z"
          />
          <path d="M200 404 L200 448" stroke="#1E1B18" strokeWidth="1.5" />

          {/* Robe hem at 60% of waist->ankle = 485, straight, side slits from hip */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L254 390 L256 485 L144 485 Z"
          />
          {renderPatternOverlay(`clip-ngu-than-skirt-${uid}`)}
          {/* Side slits from hip */}
          <line x1="145" y1="440" x2="145" y2="485" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="255" y1="440" x2="255" y2="485" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="148" y1="390" x2="148" y2="440" stroke="#1E1B18" strokeWidth="2" />
          <path d="M182 390 L180 485" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />
          <path d="M218 390 L220 485" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />
        </g>
      );
    }

    if (outfit === 'tu-than-yem') {
      return (
        <g
          data-part="lower-tu-than"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* Long black skirt (váy đụp, fill #2B2622) to ankle, slightly flared */}
          <path
            fill="#2B2622"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L254 390 Q262 470 268 548 L132 548 Q138 470 146 390 Z"
          />
          {/* Pleat details */}
          <path d="M172 392 Q168 470 162 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
          <path d="M228 392 Q232 470 238 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
          <path d="M200 392 L200 548" stroke="#1E1B18" strokeWidth="1.5" fill="none" />

          {/* Coat sides hang to knee level (knee ≈ 485) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L160 390 L156 485 L138 485 Q142 435 146 390 Z"
          />
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M240 390 L254 390 Q258 435 262 485 L244 485 L240 390 Z"
          />
        </g>
      );
    }

    if (outfit === 'ba-ba-khan-ran') {
      return (
        <g
          data-part="lower-ba-ba"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* Black wide-leg trousers (fill #2B2622) to ankle */}
          <path
            fill="#2B2622"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M142 390 L258 390 L262 548 L204 548 L201 445 L199 445 L196 548 L138 548 Z"
          />
          <path d="M200 400 L200 445" stroke="#1E1B18" strokeWidth="1.5" />
          <path d="M170 410 L168 548" stroke="#1E1B18" strokeWidth="1.5" />
          <path d="M230 410 L232 548" stroke="#1E1B18" strokeWidth="1.5" />

          {/* Shirt hem just below hips (waist + 15% = 414) */}
          {isFemale ? (
            <path
              fill={garmentColor.fill}
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M150 390 L250 390 Q252 405 248 414 Q200 418 152 414 Q148 405 150 390 Z"
            />
          ) : (
            <path
              fill={garmentColor.fill}
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M146 390 L254 390 L254 414 L146 414 Z"
            />
          )}
          <line x1="200" y1="390" x2="200" y2="414" stroke="#1E1B18" strokeWidth="2.5" />
        </g>
      );
    }

    if (outfit === 'truc-linh') {
      const ribbonColor = isFemale ? '#8E1B1B' : garmentColor.shadow;
      return (
        <g
          data-part="lower-truc-linh"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* Below hem — male: pale grey layer #D9D4CB to mid-calf (y=516), then trousers #3A332E to ankle (y=548); female: olive pleated skirt #6B6F4A to the ankle */}
          {isFemale ? (
            <g data-part="skirt-olive">
              {/* Olive pleated skirt #6B6F4A to ankle */}
              <path
                fill="#6B6F4A"
                stroke="#1E1B18"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M146 390 L254 390 Q262 470 268 548 L132 548 Q138 470 146 390 Z"
              />
              {/* Pleat lines */}
              <path d="M166 482 L160 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
              <path d="M183 482 L180 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
              <path d="M200 482 L200 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
              <path d="M217 482 L220 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
              <path d="M234 482 L240 548" stroke="#1E1B18" strokeWidth="1.8" fill="none" />
            </g>
          ) : (
            <g data-part="under-male">
              {/* Trousers #3A332E to ankle */}
              <path
                fill="#3A332E"
                stroke="#1E1B18"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M144 390 L256 390 L260 548 L204 548 L201 440 L199 440 L196 548 L140 548 Z"
              />
              {/* Pale grey inner layer #D9D4CB to mid-calf (516) */}
              <path
                fill="#D9D4CB"
                stroke="#1E1B18"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M144 390 L256 390 L259 516 L141 516 Z"
              />
              <line x1="200" y1="482" x2="200" y2="516" stroke="#1E1B18" strokeWidth="1.8" />
            </g>
          )}

          {/* Outer robe hem at 58% of waist->ankle = 482, gently flared */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L254 390 Q258 440 262 482 L138 482 Q142 440 146 390 Z"
          />
          {renderPatternOverlay(`clip-truc-linh-skirt-${uid}`)}

          {/* Side slits */}
          <line x1="140" y1="462" x2="140" y2="482" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="260" y1="462" x2="260" y2="482" stroke="#1E1B18" strokeWidth="2.5" />

          {/* Folds/shadows 15% darker */}
          <path d="M172 390 Q168 440 164 482" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          <path d="M228 390 Q232 440 236 482" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />

          {/* Inner robe between bands: cream #F1ECE2 */}
          <path
            d="M191 390 L209 390 L209 482 L191 482 Z"
            fill="#F1ECE2"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="200" y1="390" x2="200" y2="482" stroke="#D9D4CB" strokeWidth="1.5" />

          {/* Two wide cream bands (#FBF7EE, ≈12% torso width = 12px) running straight down to hem */}
          <path
            d="M179 390 L191 390 L191 482 L179 482 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M209 390 L221 390 L221 482 L209 482 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Two ribbons hanging down to knee level (y ≈ 482) */}
          <path d="M196 390 Q195 436 194 482" stroke={ribbonColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M204 390 Q205 436 206 482" stroke={ribbonColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M196 390 Q195 436 194 482 M204 390 Q205 436 206 482" stroke="#1E1B18" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    if (outfit === 'ao-tac') {
      return (
        <g
          data-part="lower-ao-tac"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* White trousers #FBF7EE to ankle */}
          <path
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M144 390 L256 390 L258 548 L203 548 L201 450 L199 450 L197 548 L142 548 Z"
          />
          <path d="M200 404 L200 448" stroke="#1E1B18" strokeWidth="1.5" />

          {/* Robe hem at 80% of waist->ankle = 516, straight, side slits from hip */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L254 390 L258 516 L142 516 Z"
          />
          {renderPatternOverlay(`clip-ao-tac-skirt-${uid}`)}

          {/* Side slits from hip */}
          <line x1="143" y1="440" x2="143" y2="516" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="257" y1="440" x2="257" y2="516" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="147" y1="390" x2="147" y2="440" stroke="#1E1B18" strokeWidth="2" />

          {/* Folds/shadows 15% darker */}
          <path d="M180 390 L178 516" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />
          <path d="M220 390 L222 516" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />
        </g>
      );
    }

    if (outfit === 'nhat-binh') {
      return (
        <g
          data-part="lower-nhat-binh"
          transform={`translate(0, ${d1}) ${about(200, 390, sX, sL)}`}
        >
          {/* White trousers #FBF7EE below the hem */}
          <path
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M144 390 L256 390 L258 548 L203 548 L201 450 L199 450 L197 548 L142 548 Z"
          />
          <path d="M200 404 L200 448" stroke="#1E1B18" strokeWidth="1.5" />

          {/* Open-front robe hem at 75% of waist->ankle = 508.
              Edges meeting edge-to-edge down center (no overlap). */}
          {/* Left panel (character's right / viewer's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M146 390 L200 390 L200 508 L143 508 Z"
          />
          {/* Right panel (character's left / viewer's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M200 390 L254 390 L257 508 L200 508 Z"
          />
          {renderPatternOverlay(`clip-nhat-binh-skirt-${uid}`)}

          {/* Center edge-to-edge seam line */}
          <line x1="200" y1="390" x2="200" y2="508" stroke="#1E1B18" strokeWidth="2.5" />

          {/* Folds/shadows 15% darker */}
          <path d="M172 390 L170 508" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />
          <path d="M228 390 L230 508" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />

          {/* Two narrow #E9B824 ribbons (dải Thùy lưu) hanging down to near hem (y ≈ 500) */}
          <path d="M192 390 L191 500" stroke="#E9B824" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M208 390 L209 500" stroke="#E9B824" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M192 390 L191 500 M208 390 L209 500" stroke="#1E1B18" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    return null;
  };

  const renderUpperClothing = () => {
    if (outfit === 'casual') {
      return (
        <g data-part="shirt" transform={about(200, 280, sX, sT)}>
          {isFemale ? (
            <>
              <path
                className="cb-shirt cb-outline"
                fill="#FBF7EE"
                stroke="#1E1B18"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M178 270 Q200 290 222 270 L250 284 Q272 296 294 352 L256 368 L251 346 Q246 372 254 404 Q200 410 146 404 Q154 372 149 346 L144 368 L106 352 Q128 296 150 284 Z"
              />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M110 350 L143 362 L145 368 L106 352 Z" />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M290 350 L257 362 L255 368 L294 352 Z" />
              <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M110 345 L145 360" />
              <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M290 345 L255 360" />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M155 392 Q185 384 176 398 Q165 400 155 400 Z" />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M245 384 Q228 380 216 396 Q236 398 245 396 Z" />
            </>
          ) : (
            <>
              <path
                className="cb-shirt cb-outline"
                fill="#FBF7EE"
                stroke="#1E1B18"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M178 270 Q200 290 222 270 L256 284 Q278 296 300 352 L262 368 L254 346 Q254 372 254 404 Q200 410 146 404 Q146 372 146 346 L138 368 L100 352 Q122 296 144 284 Z"
              />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M104 350 L137 362 L139 368 L100 352 Z" />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M296 350 L263 362 L261 368 L300 352 Z" />
              <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M104 345 L139 360" />
              <path className="cb-detail" fill="none" stroke="#1E1B18" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M296 345 L261 360" />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M152 392 Q185 384 176 398 Q165 400 152 400 Z" />
              <path className="cb-shirt-shade" fill="#E8E1D2" d="M248 384 Q228 380 216 396 Q236 398 248 396 Z" />
            </>
          )}
          {/* Common collar, pocket & details */}
          <path
            className="cb-shirt cb-outline"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M176 268 Q200 296 224 268 L218 266 Q200 286 182 266 Z"
          />
          <rect
            className="cb-shirt cb-outline"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            x="160"
            y="304"
            width="24"
            height="24"
            rx="2"
          />
          <path
            className="cb-detail"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M160 311 L184 311"
          />
        </g>
      );
    }

    if (outfit === 'giao-linh') {
      return (
        <g data-part="upper-giao-linh" transform={about(200, 280, sX, sT)}>
          {/* Wide sleeves (tay thụng) */}
          {/* Left sleeve (character's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 C120 310 102 360 98 402 L140 402 Q154 395 146 350 Z"
          />
          <path d="M108 398 Q122 360 146 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />

          {/* Right sleeve (character's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 C280 310 298 360 302 402 L260 402 Q246 395 254 350 Z"
          />
          <path d="M292 398 Q278 360 254 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />

          {/* Main Torso */}
          <path
            id={`giao-linh-torso-${uid}`}
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L250 284 L254 396 L146 396 Z"
          />
          {renderPatternOverlay(`clip-giao-linh-torso-${uid}`)}

          {/* Cross Collar forming 'y':
              OUTER panel edge runs from character's LEFT neck (viewer's right, 214, 268)
              diagonally down to character's RIGHT waist (viewer's left, 150, 392).
              Band is 8px wide, fill #FBF7EE, outlined. */}
          {/* Inner collar short line from viewer's-left neck toward center */}
          <path
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            d="M186 268 L198 292 L192 295 L180 268 Z"
          />

          {/* Outer collar band */}
          <path
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M214 268 L150 392 L142 392 L206 268 Z"
          />

          {/* Small cord tie with two short hanging ends at viewer's-left waist (150, 390) */}
          <g>
            <circle cx="150" cy="390" r="4.5" fill="#FBF7EE" stroke="#1E1B18" strokeWidth="2.5" />
            <path
              d="M149 393 Q146 410 144 425 M151 393 Q155 410 157 423"
              stroke="#FBF7EE"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M149 393 Q146 410 144 425 M151 393 Q155 410 157 423"
              stroke="#1E1B18"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Female silk sash at waist (#E9B824) */}
          {isFemale && (
            <rect
              x="146"
              y="386"
              width="108"
              height="8"
              fill="#E9B824"
              stroke="#1E1B18"
              strokeWidth="2"
            />
          )}

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'vien-linh') {
      return (
        <g data-part="upper-vien-linh" transform={about(200, 280, sX, sT)}>
          {/* Wide sleeves (tay thụng) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 C120 310 102 360 98 402 L140 402 Q154 395 146 350 Z"
          />
          <path d="M108 398 Q122 360 146 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />

          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 C280 310 298 360 302 402 L260 402 Q246 395 254 350 Z"
          />
          <path d="M292 398 Q278 360 254 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />

          {/* Main Torso */}
          <path
            id={`vien-linh-torso-${uid}`}
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L250 284 L254 396 L146 396 Z"
          />
          {renderPatternOverlay(`clip-vien-linh-torso-${uid}`)}

          {/* ROUND COLLAR: circular band (8px, slightly darker shade) hugging base of neck. NO V or cross shape. */}
          <ellipse cx="200" cy="272" rx="24" ry="12" fill={garmentColor.shadow} stroke="#1E1B18" strokeWidth="3" />
          <ellipse cx="200" cy="271" rx="16" ry="7" fill="#FFFDF7" stroke="#1E1B18" strokeWidth="2" />

          {/* Closure: curved line from collar toward character's RIGHT shoulder and down to character's RIGHT armpit (viewer's left) */}
          <path
            d="M184 274 Q160 295 148 350"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Buttons: 1 at collar, 1 at armpit */}
          <circle cx="184" cy="274" r="3.5" fill="#E9B824" stroke="#1E1B18" strokeWidth="2" />
          <circle cx="148" cy="350" r="3.5" fill="#E9B824" stroke="#1E1B18" strokeWidth="2" />

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'ngu-than-lap-co') {
      return (
        <g data-part="upper-ngu-than" transform={about(200, 280, sX, sT)}>
          {/* Narrow sleeves (tay chẽn) fitted to wrist */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 Q126 315 108 402 L128 402 Q140 365 146 350 Z"
          />
          <path d="M112 398 Q125 365 146 350" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />

          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 Q274 315 292 402 L272 402 Q260 365 254 350 Z"
          />
          <path d="M288 398 Q275 365 254 350" stroke={garmentColor.shadow} strokeWidth="2" fill="none" />

          {/* Torso body */}
          <path
            id={`ngu-than-torso-${uid}`}
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L250 284 L254 396 L146 396 Z"
          />
          {renderPatternOverlay(`clip-ngu-than-torso-${uid}`)}

          {/* STANDING COLLAR: short upright band ≈10px tall around neck, closed at front */}
          <rect
            x="187"
            y="260"
            width="26"
            height="12"
            rx="4"
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
          />
          <line x1="200" y1="260" x2="200" y2="272" stroke="#1E1B18" strokeWidth="2.5" />

          {/* FIVE buttons along outer panel edge:
              1 at collar, then diagonally from collar to character's RIGHT armpit (viewer's left) with 2 buttons,
              then straight down side seam with 2 buttons. */}
          <path
            d="M196 268 Q174 300 148 346 L148 396"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Button 1: at collar */}
          <circle cx="196" cy="268" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          {/* Buttons 2 & 3: along diagonal edge */}
          <circle cx="178" cy="298" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          <circle cx="162" cy="324" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          {/* Buttons 4 & 5: along side seam */}
          <circle cx="148" cy="360" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          <circle cx="148" cy="386" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'tu-than-yem') {
      return (
        <g data-part="upper-tu-than" transform={about(200, 280, sX, sT)}>
          {/* Narrow sleeves to wrist */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 Q126 315 108 402 L128 402 Q140 365 146 350 Z"
          />
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 Q274 315 292 402 L272 402 Q260 365 254 350 Z"
          />

          {/* Yếm (bib) under coat: rounded top edge across chest, thin neck strap, fill #D9442B */}
          <path
            fill="#D9442B"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            d="M176 296 Q200 304 224 296 L224 386 L176 386 Z"
          />
          <line x1="188" y1="270" x2="180" y2="296" stroke="#1E1B18" strokeWidth="2" />
          <line x1="212" y1="270" x2="220" y2="296" stroke="#1E1B18" strokeWidth="2" />

          {/* Coat open at front: two front panels from shoulders, NOT overlapping,
              leaving a V gap showing yếm; crossing into a KNOT at belly level (200, 385) */}
          {/* Left panel (viewer's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L176 284 L196 385 L146 385 L146 350 Z"
          />
          {/* Right panel (viewer's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 L224 284 L204 385 L254 385 L254 350 Z"
          />

          {/* Silk sash at waist (fill #E9B824) */}
          <rect
            x="146"
            y="378"
            width="108"
            height="9"
            fill="#E9B824"
            stroke="#1E1B18"
            strokeWidth="2.5"
          />

          {/* Knot at belly level with two short hanging tails */}
          <circle cx="200" cy="385" r="5.5" fill={garmentColor.fill} stroke="#1E1B18" strokeWidth="2.5" />
          <path
            d="M197 388 Q193 404 191 418 M203 388 Q207 404 209 418"
            stroke={garmentColor.fill}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M197 388 Q193 404 191 418 M203 388 Q207 404 209 418"
            stroke="#1E1B18"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'ba-ba-khan-ran') {
      return (
        <g data-part="upper-ba-ba" transform={about(200, 280, sX, sT)}>
          {/* Long fairly narrow sleeves to wrist */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 Q126 315 108 402 L128 402 Q140 365 146 350 Z"
          />
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 Q274 315 292 402 L272 402 Q260 365 254 350 Z"
          />

          {/* Torso shirt */}
          {isFemale ? (
            /* Female: waist taken in slightly (≈6% = 6.5px each side), gently curved */
            <path
              id={`ba-ba-torso-${uid}`}
              fill={garmentColor.fill}
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M150 284 Q146 320 153 365 Q150 385 150 396 L250 396 Q250 385 247 365 Q254 320 250 284 Z"
            />
          ) : (
            /* Male: boxy cut */
            <path
              id={`ba-ba-torso-${uid}`}
              fill={garmentColor.fill}
              stroke="#1E1B18"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M150 284 L250 284 L254 396 L146 396 Z"
            />
          )}
          {renderPatternOverlay(`clip-ba-ba-torso-${uid}`)}

          {/* Collarless ROUND neckline */}
          <path
            d="M182 270 Q200 286 218 270"
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Center-front vertical opening with 5 small buttons */}
          <line x1="200" y1="286" x2="200" y2="396" stroke="#1E1B18" strokeWidth="2.5" />
          <circle cx="200" cy="298" r="2.5" fill="#1E1B18" stroke="#FBF7EE" strokeWidth="1" />
          <circle cx="200" cy="322" r="2.5" fill="#1E1B18" stroke="#FBF7EE" strokeWidth="1" />
          <circle cx="200" cy="346" r="2.5" fill="#1E1B18" stroke="#FBF7EE" strokeWidth="1" />
          <circle cx="200" cy="370" r="2.5" fill="#1E1B18" stroke="#FBF7EE" strokeWidth="1" />
          <circle cx="200" cy="392" r="2.5" fill="#1E1B18" stroke="#FBF7EE" strokeWidth="1" />

          {/* Male: two large patch pockets on lower front (left and right) */}
          {!isFemale && (
            <g>
              <rect
                x="156"
                y="362"
                width="24"
                height="26"
                rx="2"
                fill={garmentColor.fill}
                stroke="#1E1B18"
                strokeWidth="2"
              />
              <line x1="156" y1="368" x2="180" y2="368" stroke="#1E1B18" strokeWidth="1.5" />

              <rect
                x="220"
                y="362"
                width="24"
                height="26"
                rx="2"
                fill={garmentColor.fill}
                stroke="#1E1B18"
                strokeWidth="2"
              />
              <line x1="220" y1="368" x2="244" y2="368" stroke="#1E1B18" strokeWidth="1.5" />
            </g>
          )}

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'truc-linh') {
      const ribbonColor = isFemale ? '#8E1B1B' : garmentColor.shadow;
      return (
        <g data-part="upper-truc-linh" transform={about(200, 280, sX, sT)}>
          {/* Wide sleeves (tay thụng) */}
          {/* Left sleeve (character's right / viewer's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 C120 310 102 360 98 402 L140 402 Q154 395 146 350 Z"
          />
          <path d="M108 398 Q122 360 146 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* Cream lining #FBF7EE visible at cuff opening */}
          <path
            d="M98 402 L140 402 L137 394 L101 394 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Right sleeve (character's left / viewer's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 C280 310 298 360 302 402 L260 402 Q246 395 254 350 Z"
          />
          <path d="M292 398 Q278 360 254 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* Cream lining #FBF7EE visible at cuff opening */}
          <path
            d="M260 402 L302 402 L299 394 L263 394 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Main Torso */}
          <path
            id={`truc-linh-torso-${uid}`}
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L250 284 L254 396 L146 396 Z"
          />
          {renderPatternOverlay(`clip-truc-linh-torso-${uid}`)}

          {/* Between the bands: cream inner robe #F1ECE2 */}
          <path
            d="M191 268 L209 268 L209 396 L191 396 Z"
            fill="#F1ECE2"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M189 268 Q200 274 211 268" stroke="#1E1B18" strokeWidth="2" fill="none" />
          <line x1="200" y1="274" x2="200" y2="396" stroke="#D9D4CB" strokeWidth="1.5" />

          {/* STRAIGHT COLLAR: two wide cream bands (#FBF7EE, ≈12% of torso width = 12px)
              start behind the neck and run STRAIGHT DOWN both front edges, parallel, to hem.
              NO crossing, NO V. */}
          {/* Collar behind neck */}
          <path
            d="M179 268 Q200 260 221 268 L221 262 Q200 254 179 262 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Left band (running straight down) */}
          <path
            d="M179 268 L191 268 L191 396 L179 396 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Right band (running straight down) */}
          <path
            d="M209 268 L221 268 L221 396 L209 396 Z"
            fill="#FBF7EE"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Tie at mid-chest (y ≈ 328) with two long ribbons hanging down */}
          <g data-part="tie-ribbons">
            {/* Cord across bands */}
            <line x1="187" y1="328" x2="213" y2="328" stroke={ribbonColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="187" y1="328" x2="213" y2="328" stroke="#1E1B18" strokeWidth="1" strokeLinecap="round" />
            {/* Knot */}
            <circle cx="200" cy="328" r="4.5" fill={ribbonColor} stroke="#1E1B18" strokeWidth="2" />
            {/* Bow loops */}
            <path d="M196 328 Q187 324 191 331 Z" fill={ribbonColor} stroke="#1E1B18" strokeWidth="1.5" />
            <path d="M204 328 Q213 324 209 331 Z" fill={ribbonColor} stroke="#1E1B18" strokeWidth="1.5" />
            {/* Ribbons hanging down through upper torso to y=396 */}
            <path d="M197 331 Q196 364 196 396" stroke={ribbonColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M203 331 Q204 364 204 396" stroke={ribbonColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M197 331 Q196 364 196 396 M203 331 Q204 364 204 396" stroke="#1E1B18" strokeWidth="1" strokeLinecap="round" fill="none" />
          </g>

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'ao-tac') {
      return (
        <g data-part="upper-ao-tac" transform={about(200, 280, sX, sT)}>
          {/* VERY WIDE sleeves (tay thụng rất rộng, cuff opening ≈ 2.4x upper-arm width ≈ 58px)
              Sleeve ends extend past wrists (down to y=422) covering hands completely */}
          {/* Left sleeve (character's right / viewer's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 C116 312 90 368 82 422 L146 422 Q158 402 146 350 Z"
          />
          <path d="M96 418 Q118 368 146 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* Sleeve cuff inner shadow/crease */}
          <path d="M86 420 L142 420" stroke={garmentColor.shadow} strokeWidth="2" />

          {/* Right sleeve (character's left / viewer's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 C284 312 310 368 318 422 L254 422 Q242 402 254 350 Z"
          />
          <path d="M304 418 Q282 368 254 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* Sleeve cuff inner shadow/crease */}
          <path d="M258 420 L314 420" stroke={garmentColor.shadow} strokeWidth="2" />

          {/* Torso body: same standing collar and 5-button diagonal-then-down closure as ngu-than-lap-co */}
          <path
            id={`ao-tac-torso-${uid}`}
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L250 284 L254 396 L146 396 Z"
          />
          {renderPatternOverlay(`clip-ao-tac-torso-${uid}`)}

          {/* STANDING COLLAR: short upright band ≈10px tall around neck, closed at front */}
          <rect
            x="187"
            y="260"
            width="26"
            height="12"
            rx="4"
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
          />
          <line x1="200" y1="260" x2="200" y2="272" stroke="#1E1B18" strokeWidth="2.5" />

          {/* FIVE buttons along outer panel edge:
              1 at collar, then diagonally from collar to character's RIGHT armpit (viewer's left) with 2 buttons,
              then straight down side seam with 2 buttons. */}
          <path
            d="M196 268 Q174 300 148 346 L148 396"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Button 1: at collar */}
          <circle cx="196" cy="268" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          {/* Buttons 2 & 3: along diagonal edge */}
          <circle cx="178" cy="298" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          <circle cx="162" cy="324" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          {/* Buttons 4 & 5: along side seam */}
          <circle cx="148" cy="360" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />
          <circle cx="148" cy="386" r="3" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.8" />

          {renderRankBadge()}
        </g>
      );
    }

    if (outfit === 'nhat-binh') {
      return (
        <g data-part="upper-nhat-binh" transform={about(200, 280, sX, sT)}>
          {/* Wide long sleeves with 5-color striped cuffs:
              green #3E7D4F, yellow #E9B824, blue #2F4A7A, white #FBF7EE, red #D9442B */}
          {/* Left sleeve (character's right / viewer's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 C120 310 102 360 98 402 L140 402 Q154 395 146 350 Z"
          />
          <path d="M108 398 Q122 360 146 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* 5-stripe cuff on left sleeve: top-to-bottom green, yellow, blue, white, red */}
          <g data-part="cuff-stripes-left">
            <rect x="98" y="382" width="42" height="4" fill="#3E7D4F" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="98" y="386" width="42" height="4" fill="#E9B824" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="98" y="390" width="42" height="4" fill="#2F4A7A" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="98" y="394" width="42" height="4" fill="#FBF7EE" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="98" y="398" width="42" height="4" fill="#D9442B" stroke="#1E1B18" strokeWidth="0.8" />
          </g>

          {/* Right sleeve (character's left / viewer's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M250 284 C280 310 298 360 302 402 L260 402 Q246 395 254 350 Z"
          />
          <path d="M292 398 Q278 360 254 350" stroke={garmentColor.shadow} strokeWidth="2.5" fill="none" />
          {/* 5-stripe cuff on right sleeve */}
          <g data-part="cuff-stripes-right">
            <rect x="260" y="382" width="42" height="4" fill="#3E7D4F" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="260" y="386" width="42" height="4" fill="#E9B824" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="260" y="390" width="42" height="4" fill="#2F4A7A" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="260" y="394" width="42" height="4" fill="#FBF7EE" stroke="#1E1B18" strokeWidth="0.8" />
            <rect x="260" y="398" width="42" height="4" fill="#D9442B" stroke="#1E1B18" strokeWidth="0.8" />
          </g>

          {/* Torso body: open-front robe (đối khâm), edges meet edge-to-edge down center (no overlap) */}
          {/* Left panel (character's right / viewer's left) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M150 284 L200 284 L200 396 L146 396 Z"
          />
          {/* Right panel (character's left / viewer's right) */}
          <path
            fill={garmentColor.fill}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M200 284 L250 284 L254 396 L200 396 Z"
          />
          {renderPatternOverlay(`clip-nhat-binh-torso-${uid}`)}

          {/* Center edge-to-edge seam */}
          <line x1="200" y1="284" x2="200" y2="396" stroke="#1E1B18" strokeWidth="2.5" />

          {/* RECTANGLE COLLAR: two wide bands (≈14% torso width = 14px, fill #E9B824, outlined)
              run from shoulders down both sides of chest and are joined by a horizontal band at mid-chest (y ≈ 336),
              forming a clear gold rectangle on chest */}
          {/* Collar base behind neck */}
          <path
            d="M178 272 Q200 262 222 272 L222 265 Q200 256 178 265 Z"
            fill="#E9B824"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Left vertical gold band */}
          <path
            d="M178 270 L192 270 L192 336 L178 336 Z"
            fill="#E9B824"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Right vertical gold band */}
          <path
            d="M208 270 L222 270 L222 336 L208 336 Z"
            fill="#E9B824"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Horizontal gold band at mid-chest joining the two bands */}
          <rect
            x="178"
            y="324"
            width="44"
            height="14"
            fill="#E9B824"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* 2–3 small gold buttons on horizontal band */}
          <circle cx="187" cy="331" r="2.8" fill="#FBF7EE" stroke="#1E1B18" strokeWidth="1.6" />
          <circle cx="200" cy="331" r="2.8" fill="#FBF7EE" stroke="#1E1B18" strokeWidth="1.6" />
          <circle cx="213" cy="331" r="2.8" fill="#FBF7EE" stroke="#1E1B18" strokeWidth="1.6" />

          {/* Inner garment peeking inside collar rectangle */}
          <rect x="193" y="270" width="14" height="53" fill="#FFFDF7" opacity="0.3" />

          {/* Two narrow ribbons (dải Thùy lưu, #E9B824) hanging from bottom of chest rectangle down toward hem */}
          <g data-part="thuy-luu-ribbons">
            <path d="M192 338 L192 396" stroke="#E9B824" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M208 338 L208 396" stroke="#E9B824" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M192 338 L192 396 M208 338 L208 396" stroke="#1E1B18" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            {/* Small decorative knots at top of ribbons */}
            <circle cx="192" cy="340" r="2.5" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.2" />
            <circle cx="208" cy="340" r="2.5" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.2" />
          </g>

          {renderRankBadge()}
        </g>
      );
    }

    return null;
  };

  // Shows a real face ONLY when it receives the explicit prop faceImage (or propFaceCutout).
  // Default: no prop -> chibi face (eyes, eyebrows, mouth, blush visible).
  const effectiveFaceCutout = propFaceImage || propFaceCutout || null;
  const facePatchUrl =
    effectiveFaceCutout?.facePatchUrl ||
    effectiveFaceCutout?.dataUrl ||
    null;

  // Face placement geometry per Section 3 (fill the chibi face fit)
  const chibiHeadR = 90;
  const chibiHeadCx = 200;
  const chibiChinY = 260;

  const getFringeY = (styleId: string, isFem: boolean): number => {
    switch (styleId) {
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
  };

  const fringeY = getFringeY(actualHairStyle, isFemale);
  const targetW = 2 * FACE_FIT.sideInset * chibiHeadR * FACE_FIT.fill;
  const targetT = fringeY - FACE_FIT.topOverlap * chibiHeadR;
  const targetB = chibiChinY - FACE_FIT.chinInset * chibiHeadR;
  let targetH = (targetB - targetT) * FACE_FIT.fill;

  const photoBoxW = effectiveFaceCutout?.photoFaceBoxWidth || 1;
  const photoBoxH = effectiveFaceCutout?.photoFaceBoxHeight || 1.25;
  const naturalH = targetW * (photoBoxH / photoBoxW);
  const minAllowedH = naturalH * FACE_FIT.maxSquash;
  if (targetH < minAllowedH) {
    targetH = minAllowedH;
  }

  const faceBoxX = chibiHeadCx - targetW / 2 + FACE_FIT.offsetX;
  const faceBoxY = targetB - targetH + FACE_FIT.offsetY;

  const isFaceGeomValid =
    !isNaN(targetW) && !isNaN(targetH) && !isNaN(faceBoxX) && !isNaN(faceBoxY) && targetW > 0 && targetH > 0;

  const [isFaceLoaded, setIsFaceLoaded] = React.useState(false);
  const [faceLoadError, setFaceLoadError] = React.useState(false);
  const loggedFaceRef = React.useRef(false);
  const warnedGeomRef = React.useRef(false);

  React.useEffect(() => {
    setIsFaceLoaded(false);
    setFaceLoadError(false);
    warnedGeomRef.current = false;
  }, [facePatchUrl]);

  React.useEffect(() => {
    if (facePatchUrl && !loggedFaceRef.current) {
      loggedFaceRef.current = true;
      console.log('[ChibiFigure] faceImage reached Step 4 with URL length:', facePatchUrl.length);
    }
  }, [facePatchUrl]);

  if (facePatchUrl && !isFaceGeomValid && !warnedGeomRef.current) {
    warnedGeomRef.current = true;
    console.warn('[ChibiFigure] S/x/y is NaN or invalid, falling back to chibi face');
  }

  const faceClipUid = useId().replace(/:/g, '');
  const faceClipId = `real-face-clip-${faceClipUid}`;

  // When FACE_FIT.syncHeadSkin is true: fill the chibi head shape, ears, neck and hands with skinHex
  // (only in step 4 with the real face)
  const effectiveSkinTone =
    facePatchUrl && FACE_FIT.syncHeadSkin && effectiveFaceCutout?.skinHex
      ? effectiveFaceCutout.skinHex
      : actualSkinTone;

  const shouldHideChibiFeatures =
    Boolean(facePatchUrl) && isFaceGeomValid && isFaceLoaded && !faceLoadError;

  // Real eyes y for kính râm: eye y = B - H + H * (photo eyeMid y within face box / face box height)
  const photoEyeNormY = effectiveFaceCutout?.photoEyeNormY ?? 0.42;
  const realEyeY = faceBoxY + targetH * photoEyeNormY;
  const kinhRamShiftY = shouldHideChibiFeatures ? realEyeY - 188 : 0;

  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  // Dynamic tight viewBox for fit="content"
  React.useLayoutEffect(() => {
    if (fit !== 'content') return;
    const g = figureGroupRef.current;
    if (!g) return;

    const measure = () => {
      try {
        const bbox = g.getBBox();
        if (bbox.width > 0 && bbox.height > 0) {
          const padX = bbox.width * 0.02;
          const padY = bbox.height * 0.02;
          const vx = bbox.x - padX;
          const vy = bbox.y - padY;
          const vw = bbox.width + padX * 2;
          const vh = bbox.height + padY * 2;
          const newVb = `${vx} ${vy} ${vw} ${vh}`;
          setContentViewBox(newVb);
        }
      } catch (e) {
        // SVG might not be attached to DOM yet
      }
    };

    measure();
    // Also re-measure on next tick if images/fonts take a frame to settle
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [
    fit,
    activeOutfitId,
    displayedLook.gender,
    actualHeight,
    actualWeight,
    actualHairStyle,
    actualHairColor,
    activeFabricColor,
    activePatternId,
    activeAccessories,
    sX,
    spriteScaleY,
    d1,
    d2,
    effectiveFaceCutout,
  ]);

  const defaultViewBox = '0 -50 400 650';
  const effectiveViewBox =
    fit === 'content' && contentViewBox ? contentViewBox : defaultViewBox;

  const svgWidth = width ?? (fit === 'content' ? (height ? undefined : size) : size);
  const svgHeight = height ?? (fit === 'content' ? undefined : (typeof size === 'number' ? size * (650 / 400) : undefined));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={effectiveViewBox}
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      width={svgWidth}
      height={svgHeight}
      data-character={isFemale ? 'female' : 'male'}
      data-outfit={outfit}
      data-export-character="true"
      className={`select-none overflow-visible ${className}`}
      style={
        {
          '--cb-skin': effectiveSkinTone,
          '--cb-hair': actualHairColor,
          ...style,
        } as React.CSSProperties
      }
    >
      <defs>
        {/* Clip path for real face: chibi head/face shape inset by 3px */}
        <clipPath id={`chibi-face-clip-${uid}`}>
          <ellipse cx="200" cy="172" rx="89" ry="87" />
        </clipPath>

        {/* Clip paths for patterns */}
        <clipPath id={`clip-giao-linh-skirt-${uid}`}>
          <path d="M146 390 L254 390 Q258 440 262 493 L138 493 Q142 440 146 390 Z" />
        </clipPath>
        <clipPath id={`clip-giao-linh-torso-${uid}`}>
          <path d="M150 284 L250 284 L254 396 L146 396 Z" />
        </clipPath>

        <clipPath id={`clip-truc-linh-skirt-${uid}`}>
          <path d="M146 390 L254 390 Q258 440 262 482 L138 482 Q142 440 146 390 Z" />
        </clipPath>
        <clipPath id={`clip-truc-linh-torso-${uid}`}>
          <path d="M150 284 L250 284 L254 396 L146 396 Z" />
        </clipPath>

        <clipPath id={`clip-vien-linh-skirt-${uid}`}>
          <path d="M146 390 L254 390 Q262 460 268 529 L132 529 Q138 460 146 390 Z" />
        </clipPath>
        <clipPath id={`clip-vien-linh-torso-${uid}`}>
          <path d="M150 284 L250 284 L254 396 L146 396 Z" />
        </clipPath>

        <clipPath id={`clip-ngu-than-skirt-${uid}`}>
          <path d="M146 390 L254 390 L256 485 L144 485 Z" />
        </clipPath>
        <clipPath id={`clip-ngu-than-torso-${uid}`}>
          <path d="M150 284 L250 284 L254 396 L146 396 Z" />
        </clipPath>

        <clipPath id={`clip-ao-tac-skirt-${uid}`}>
          <path d="M146 390 L254 390 L258 516 L142 516 Z" />
        </clipPath>
        <clipPath id={`clip-ao-tac-torso-${uid}`}>
          <path d="M150 284 L250 284 L254 396 L146 396 Z" />
        </clipPath>

        <clipPath id={`clip-nhat-binh-skirt-${uid}`}>
          <path d="M146 390 L254 390 L257 508 L143 508 Z" />
        </clipPath>
        <clipPath id={`clip-nhat-binh-torso-${uid}`}>
          <path d="M150 284 L250 284 L254 396 L146 396 Z" />
        </clipPath>

        <clipPath id={`clip-ba-ba-torso-${uid}`}>
          {isFemale ? (
            <path d="M150 284 Q146 320 153 365 Q150 385 150 396 L250 396 Q250 385 247 365 Q254 320 250 284 Z" />
          ) : (
            <path d="M150 284 L250 284 L254 396 L146 396 Z" />
          )}
        </clipPath>

        {/* Pattern: Hoa Sen */}
        <pattern id={`pattern-hoa-sen-${uid}`} width="36" height="36" patternUnits="userSpaceOnUse">
          <g transform="translate(18, 18)" stroke={garmentColor.shadow} fill="none" strokeWidth="1.6" opacity="0.45">
            <path d="M0 -8 C-4 -2 -6 4 0 8 C6 4 4 -2 0 -8 Z" />
            <path d="M-5 -2 C-9 2 -8 7 -2 8" />
            <path d="M5 -2 C9 2 8 7 2 8" />
            <circle cx="0" cy="9" r="1" fill={garmentColor.shadow} />
          </g>
        </pattern>

        {/* Pattern: Mây Sóng Nước */}
        <pattern id={`pattern-may-song-${uid}`} width="32" height="24" patternUnits="userSpaceOnUse">
          <g stroke={garmentColor.shadow} fill="none" strokeWidth="1.8" opacity="0.45">
            <path d="M0 8 Q8 2 16 8 T32 8" />
            <path d="M0 16 Q8 10 16 16 T32 16" />
            <path d="M0 24 Q8 18 16 24 T32 24" />
          </g>
        </pattern>

        {/* Pattern: Rồng Phượng (Gold Swirls) */}
        <pattern id={`pattern-rong-phuong-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <g stroke="#E9B824" fill="none" strokeWidth="1.8" opacity="0.55">
            <path d="M12 20 C12 14 18 10 24 12 C28 14 28 20 22 22 C18 24 16 28 20 30 C24 32 30 28 32 22" />
            <circle cx="20" cy="18" r="2" fill="#E9B824" />
            <path d="M6 14 Q10 8 16 10" />
            <path d="M26 34 Q32 32 36 26" />
          </g>
        </pattern>
      </defs>

      {/* 1. Shadow (hidden when fit="content" because custom outer shadow is rendered) */}
      {fit !== 'content' && (
        <g data-part="shadow" transform={about(200, 577, sX, 1)}>
          <ellipse className="cb-shadow" cx="200" cy="577" rx="110" ry="14" />
        </g>
      )}

      {/* 2. Main Figure Group: layers: hair-back -> body/skin -> CLOTHING -> hands -> head/face -> hair-front */}
      <g
        ref={figureGroupRef}
        data-part="figure"
        className={popActive ? 'character-pop' : undefined}
        transform={`translate(0, ${-(d1 + d2)})`}
      >
        {/* Layer: Hair Back */}
        {isFemale ? (
          <FemaleHairBack styleId={actualHairStyle} color={actualHairColor} />
        ) : (
          <MaleHairBack styleId={actualHairStyle} color={actualHairColor} />
        )}

        {/* When sprite exists: hair-back -> sprite outfit (+ kiềng, túi) -> head/face -> kính râm -> hair-front -> head item */}
        {activeSprite && (
          <SpriteOutfit
            key={`sprite-${activeOutfitId}-${displayedLook.gender}`}
            sprite={activeSprite}
            appFaceCx={appFaceCx}
            appFaceCy={appFaceCy}
            appFaceR={appFaceR}
            scaleX={sX}
            scaleY={spriteScaleY}
            fabricColor={activeFabricColor}
            skinColor={effectiveSkinTone}
            patternId={activePatternId}
            hasKiengCo={hasKiengCo}
            hasTuiTote={hasTuiTote}
            renderMode={renderMode}
            onError={() => {
              setSpriteError(true);
            }}
          />
        )}

        {/* Fallback SVG outfit: body/skin -> shoes -> CLOTHING -> kiềng cổ -> túi tote -> hands */}
        {!activeSprite && (
          <>
            {/* Layer: Neck Skin */}
            <g data-part="neck">
              <rect
                className="cb-skin cb-outline"
                fill={effectiveSkinTone}
                stroke="#1E1B18"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                x="187"
                y="240"
                width="26"
                height="62"
                rx="8"
              />
            </g>

            {/* Casual bare arms (only rendered when casual) */}
            {outfit === 'casual' && (
              <>
                <g
                  data-part="arm-left"
                  transform={`translate(${-82 * (sX - 1)}, ${67 * (sT - 1)})`}
                >
                  <rect
                    className="cb-skin cb-outline"
                    fill={effectiveSkinTone}
                    stroke="#1E1B18"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    x="108"
                    y="342"
                    width="20"
                    height="62"
                    rx="10"
                  />
                  <circle
                    className="cb-skin cb-outline"
                    fill={effectiveSkinTone}
                    stroke="#1E1B18"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    cx="118"
                    cy="408"
                    r="16"
                  />
                </g>
                <g
                  data-part="arm-right"
                  transform={`translate(${82 * (sX - 1)}, ${67 * (sT - 1)})`}
                >
                  <rect
                    className="cb-skin cb-outline"
                    fill={effectiveSkinTone}
                    stroke="#1E1B18"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    x="272"
                    y="342"
                    width="20"
                    height="62"
                    rx="10"
                  />
                  <circle
                    className="cb-skin cb-outline"
                    fill={effectiveSkinTone}
                    stroke="#1E1B18"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    cx="282"
                    cy="408"
                    r="16"
                  />
                </g>
              </>
            )}

            {/* Layer: Shoes (kept for now across all outfits) */}
            <g data-part="shoes">
              <g
                data-part="shoe-left"
                transform={`translate(${-34 * (sX - 1)}, ${d1 + d2})`}
              >
                <path
                  className="cb-shoe cb-outline"
                  fill="#FFFFFF"
                  stroke="#1E1B18"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M132 566 L132 556 Q132 540 150 539 L182 539 Q200 540 200 556 L200 566 Z"
                />
                <rect
                  className="cb-sole cb-outline"
                  fill="#E8E1D2"
                  stroke="#1E1B18"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  x="130"
                  y="562"
                  width="72"
                  height="10"
                  rx="5"
                />
                <path
                  className="cb-detail"
                  fill="none"
                  stroke="#1E1B18"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M157 552 L175 552 M159 557 L173 557"
                />
              </g>
              <g
                data-part="shoe-right"
                transform={`translate(${34 * (sX - 1)}, ${d1 + d2})`}
              >
                <path
                  className="cb-shoe cb-outline"
                  fill="#FFFFFF"
                  stroke="#1E1B18"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M200 566 L200 556 Q200 540 218 539 L250 539 Q268 540 268 556 L268 566 Z"
                />
                <rect
                  className="cb-sole cb-outline"
                  fill="#E8E1D2"
                  stroke="#1E1B18"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  x="198"
                  y="562"
                  width="72"
                  height="10"
                  rx="5"
                />
                <path
                  className="cb-detail"
                  fill="none"
                  stroke="#1E1B18"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M225 552 L243 552 M227 557 L241 557"
                />
              </g>
            </g>

            {/* Layer: CLOTHING - Lower (trousers, skirts, lower robe) */}
            {renderLowerClothing()}

            {/* Layer: CLOTHING - Upper (torso, sleeves, collars, closures) */}
            {renderUpperClothing()}

            {/* Layer: Kiềng cổ for SVG fallback */}
            {hasKiengCo && <KiengCoSvg />}

            {/* Layer: Túi tote for SVG fallback */}
            {hasTuiTote && <TuiToteSvg sX={sX} sT={sT} />}

            {/* Layer: Hands (emerging at cuffs for Vietnamese long sleeves; covered for ao-tac) */}
            {outfit !== 'casual' && outfit !== 'ao-tac' && (
              <g data-part="hands">
                <g
                  data-part="hand-left"
                  transform={`translate(${-82 * (sX - 1)}, ${67 * (sT - 1)})`}
                >
                  <circle
                    className="cb-skin cb-outline"
                    fill={effectiveSkinTone}
                    stroke="#1E1B18"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    cx="118"
                    cy="408"
                    r="16"
                  />
                </g>
                <g
                  data-part="hand-right"
                  transform={`translate(${82 * (sX - 1)}, ${67 * (sT - 1)})`}
                >
                  <circle
                    className="cb-skin cb-outline"
                    fill={effectiveSkinTone}
                    stroke="#1E1B18"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    cx="282"
                    cy="408"
                    r="16"
                  />
                </g>
              </g>
            )}
          </>
        )}

        {/* Layer: Head & Ears */}
        <g data-part="head">
          <circle
            className="cb-skin cb-outline"
            fill={effectiveSkinTone}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            cx="110"
            cy="196"
            r="14"
          />
          <circle
            className="cb-skin cb-outline"
            fill={effectiveSkinTone}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            cx="290"
            cy="196"
            r="14"
          />
          <path
            className="cb-detail"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M108 190 Q103 197 109 203"
          />
          <path
            className="cb-detail"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M292 190 Q297 197 291 203"
          />
          <ellipse
            className="cb-skin cb-outline"
            fill={effectiveSkinTone}
            stroke="#1E1B18"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            cx="200"
            cy="172"
            rx="92"
            ry="90"
          />
        </g>

        {/* Layer: Real Face Image (step 4 only when faceImage prop is set) */}
        {facePatchUrl && isFaceGeomValid && !faceLoadError && (
          <g data-part="real-face">
            <defs>
              <clipPath id={faceClipId} clipPathUnits="userSpaceOnUse">
                <ellipse cx="200" cy="172" rx="92" ry="90" />
              </clipPath>
            </defs>
            <image
              href={facePatchUrl}
              x={faceBoxX}
              y={faceBoxY}
              width={targetW}
              height={targetH}
              preserveAspectRatio="none"
              clipPath={`url(#${faceClipId})`}
              onLoad={() => setIsFaceLoaded(true)}
              onError={() => {
                console.warn('[ChibiFigure] Real face image failed to load, falling back to chibi face');
                setFaceLoadError(true);
              }}
            />
          </g>
        )}

        {/* Layer: Chibi Face Features (hidden only when real face has loaded successfully) */}
        {!shouldHideChibiFeatures && (
          <g data-part="face">{renderFace()}</g>
        )}

        {/* Debug: (?debug=1, step 4 only): magenta outline of target box */}
        {isDebug && facePatchUrl && isFaceGeomValid && (
          <g data-debug="face-fit">
            <rect
              x={faceBoxX}
              y={faceBoxY}
              width={targetW}
              height={targetH}
              fill="none"
              stroke="#FF00FF"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Layer: Kính râm (repositioned onto real eyes if real face active) */}
        {hasKinhRam && (
          <g data-part="acc-kinh-ram-wrapper" transform={kinhRamShiftY ? `translate(0, ${kinhRamShiftY})` : undefined}>
            <KinhRam />
          </g>
        )}

        {/* Layer: Hair Front */}
        {isFemale ? (
          <FemaleHairFront styleId={actualHairStyle} color={actualHairColor} />
        ) : (
          <MaleHairFront styleId={actualHairStyle} color={actualHairColor} />
        )}

        {/* Layer: Headwear */}
        <g data-part="headwear">
          {hasKhanXep && <KhanXep />}
          {hasKhanMoQua && <KhanMoQua />}
          {hasNonQuaiThao && <NonQuaiThao />}
          {hasKhanRan && <KhanRan />}
        </g>

        {/* Debug: 1px magenta horizontal line at app chin (appFaceCy + appFaceR = 262) */}
        {showChinLine && (
          <line
            x1="0"
            y1={appFaceCy + appFaceR}
            x2="400"
            y2={appFaceCy + appFaceR}
            stroke="#FF00FF"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </g>
    </svg>
  );
};
