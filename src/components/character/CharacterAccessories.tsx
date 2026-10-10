import React from 'react';
import { OutfitSprite } from '../../../data/outfitSprites';

// -------------------------------------------------------------
// HEADWEAR ITEMS (Head coordinates: C = (200, 172), R = 90)
// Not scaled by height/weight
// -------------------------------------------------------------

export const KhanXep: React.FC = () => {
  // y from 172 - 1.12*90 = 71.2 to 172 - 0.42*90 = 134.2
  // width = 2.15*90 = 193.5 (from 103.25 to 296.75)
  return (
    <g data-part="acc-khan-xep">
      {/* Turban body */}
      <path
        d="M103.2 128 C102 88 135 71.2 200 71.2 C265 71.2 298 88 296.8 128 C296.8 134.2 284 135 268 133 C238 131 200 134.2 200 134.2 C200 134.2 162 131 132 133 C116 135 103.2 134.2 103.2 128 Z"
        fill="#1E1B18"
        stroke="#1E1B18"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 4 Stacked rounded band fold lines */}
      <path d="M110 88 Q200 81 290 88" fill="none" stroke="#4A433C" strokeWidth="2.5" />
      <path d="M105 103 Q200 96 295 103" fill="none" stroke="#4A433C" strokeWidth="2.5" />
      <path d="M104 118 Q200 111 296 118" fill="none" stroke="#4A433C" strokeWidth="2.5" />
      {/* Forehead crossing diagonal folds forming small "人" shape */}
      <path d="M191 121 L204 134.2" stroke="#4A433C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M209 121 L196 134.2" stroke="#4A433C" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
};

export const KhanMoQua: React.FC = () => {
  // y from 172 - 1.15*90 = 68.5 down to ears at 172 - 0.2*90 = 154
  // beak tip at forehead centre dipping to 172 - 0.5*90 = 127
  return (
    <g data-part="acc-khan-mo-qua">
      {/* Wrapping cloth */}
      <path
        d="M103 154 C99 108 130 68.5 200 68.5 C270 68.5 301 108 297 154 C285 142 242 134 200 127 C158 134 115 142 103 154 Z"
        fill="#26221E"
        stroke="#1E1B18"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Forehead beak edge contour for sharp visibility on black hair */}
      <path
        d="M103 154 C115 142 158 134 200 127 C242 134 285 142 297 154"
        fill="none"
        stroke="#5A5148"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Soft fold lines */}
      <path d="M116 136 Q160 114 200 127" fill="none" stroke="#6E6256" strokeWidth="2" strokeLinecap="round" />
      <path d="M284 136 Q240 114 200 127" fill="none" stroke="#6E6256" strokeWidth="2" strokeLinecap="round" />
      <path d="M136 96 Q200 86 264 96" fill="none" stroke="#6E6256" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
};

export const NonQuaiThao: React.FC = () => {
  // Brim ellipse centred at (200, 172 - 0.95*90) = (200, 86.5), rx = 1.9*90 = 171, ry = 0.3*90 = 27
  // Lower inner rim rx = 0.95*90 = 85.5
  // Straps down to y = 172 + 1.15*90 = 275.5 with small tassel
  // Fringe length = 0.25*90 = 22.5
  return (
    <g data-part="acc-non-quai-thao">
      {/* Straps down to below chin */}
      <path d="M60 92 Q120 220 196 275.5" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M340 92 Q280 220 204 275.5" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tassel */}
      <circle cx="200" cy="275.5" r="3.5" fill="#1E1B18" />
      <path d="M198 279 L197 293 M200 279 L200 294 M202 279 L203 293" stroke="#1E1B18" strokeWidth="1.5" strokeLinecap="round" />

      {/* Main flat wide brim */}
      <ellipse cx="200" cy="86.5" rx="171" ry="27" fill="#E8D9B5" stroke="#1E1B18" strokeWidth="2" />
      {/* 2 Concentric ring lines */}
      <ellipse cx="200" cy="86.5" rx="142" ry="22.5" fill="none" stroke="#C9B68A" strokeWidth="1.8" />
      <ellipse cx="200" cy="86.5" rx="114" ry="18" fill="none" stroke="#C9B68A" strokeWidth="1.8" />
      {/* Lower inner rim ellipse */}
      <ellipse cx="200" cy="88" rx="85.5" ry="13.5" fill="#DFCFAB" stroke="#1E1B18" strokeWidth="1.5" />

      {/* Fringe (8-10 thin lines, length 22.5px) */}
      <g stroke="#1E1B18" strokeWidth="1.5" strokeLinecap="round">
        <line x1="38" y1="88" x2="36" y2="110.5" />
        <line x1="48" y1="94" x2="47" y2="116.5" />
        <line x1="58" y1="98" x2="57" y2="120.5" />
        <line x1="68" y1="102" x2="68" y2="124.5" />
        <line x1="78" y1="105" x2="79" y2="127.5" />

        <line x1="362" y1="88" x2="364" y2="110.5" />
        <line x1="352" y1="94" x2="353" y2="116.5" />
        <line x1="342" y1="98" x2="343" y2="120.5" />
        <line x1="332" y1="102" x2="332" y2="124.5" />
        <line x1="322" y1="105" x2="321" y2="127.5" />
      </g>
    </g>
  );
};

export const KhanRan: React.FC = () => {
  // Band from y = 172 - 0.85*90 = 95.5 to y = 172 - 0.55*90 = 122.5 (height 27)
  // width = 2.05*90 = 184.5 (from 107.75 to 292.25)
  // 6x6 checker SVG pattern
  const uid = React.useId().replace(/:/g, '');
  const patternId = `acc-khan-ran-checker-${uid}`;
  return (
    <g data-part="acc-khan-ran">
      <defs>
        <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="6" height="6" fill="#1E1B18" />
          <rect x="6" y="0" width="6" height="6" fill="#FFFDF7" />
          <rect x="0" y="6" width="6" height="6" fill="#FFFDF7" />
          <rect x="6" y="6" width="6" height="6" fill="#1E1B18" />
        </pattern>
      </defs>
      {/* Head band */}
      <rect
        x="107.8"
        y="95.5"
        width="184.5"
        height="27"
        rx="6"
        fill={`url(#${patternId})`}
        stroke="#1E1B18"
        strokeWidth="2"
      />
      {/* Knot on viewer right side */}
      <ellipse cx="288" cy="109" rx="8" ry="11" fill={`url(#${patternId})`} stroke="#1E1B18" strokeWidth="2" />
      {/* 2 Tails hanging down */}
      <path
        d="M285 118 Q290 136 295 152 Q289 148 283 144 Z"
        fill={`url(#${patternId})`}
        stroke="#1E1B18"
        strokeWidth="1.8"
      />
      <path
        d="M288 118 Q298 138 304 156 Q297 150 292 144 Z"
        fill={`url(#${patternId})`}
        stroke="#1E1B18"
        strokeWidth="1.8"
      />
    </g>
  );
};

// -------------------------------------------------------------
// EYEWEAR (Kính râm): above head/face, below hair-front
// -------------------------------------------------------------

export const KinhRam: React.FC = () => {
  // Centred on eye positions (164, 188) and (236, 188)
  // Each 0.46*90 = 41.4 wide, 0.30*90 = 27 high, rx = 0.06*90 = 5.4
  return (
    <g data-part="acc-kinh-ram">
      {/* Thin arms to face edge */}
      <line x1="143" y1="184" x2="114" y2="188" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
      <line x1="257" y1="184" x2="286" y2="188" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
      {/* Bridge line */}
      <path d="M184.7 184 Q200 180 215.3 184" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />

      {/* Left lens */}
      <rect
        x="143.3"
        y="174.5"
        width="41.4"
        height="27"
        rx="5.4"
        fill="#1E1B18"
        fillOpacity="0.92"
        stroke="#1E1B18"
        strokeWidth="2"
      />
      <line x1="149" y1="179" x2="159" y2="179" stroke="#FFFDF7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

      {/* Right lens */}
      <rect
        x="215.3"
        y="174.5"
        width="41.4"
        height="27"
        rx="5.4"
        fill="#1E1B18"
        fillOpacity="0.92"
        stroke="#1E1B18"
        strokeWidth="2"
      />
      <line x1="221" y1="179" x2="231" y2="179" stroke="#FFFDF7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </g>
  );
};

// -------------------------------------------------------------
// KIỀNG CỔ: in sprite pixel coordinates (inside sprite inner group)
// -------------------------------------------------------------

export const KiengCoSprite: React.FC<{ sprite: OutfitSprite }> = ({ sprite }) => {
  const cx = sprite.face.cx;
  const cy = sprite.neckY + 24;
  const pendantY = cy + 18;

  return (
    <g data-part="acc-kieng-co">
      {/* Outer outline #B8860B 2px around stroke width 11 => total 15 */}
      <ellipse cx={cx} cy={cy} rx="64" ry="18" fill="none" stroke="#B8860B" strokeWidth="15" />
      {/* Gold ring ellipse stroke #E9B824 width 11 */}
      <ellipse cx={cx} cy={cy} rx="64" ry="18" fill="none" stroke="#E9B824" strokeWidth="11" />
      {/* Round pendant (r = 9) at front bottom */}
      <circle cx={cx} cy={pendantY} r="9" fill="#E9B824" stroke="#B8860B" strokeWidth="2" />
    </g>
  );
};

export const KiengCoSvg: React.FC = () => {
  // Equivalent neck point in SVG fallback: cx = 200, neckY = 276
  const cx = 200;
  const cy = 276;
  const pendantY = cy + 9;

  return (
    <g data-part="acc-kieng-co-svg">
      <ellipse cx={cx} cy={cy} rx="32" ry="9" fill="none" stroke="#B8860B" strokeWidth="8.5" />
      <ellipse cx={cx} cy={cy} rx="32" ry="9" fill="none" stroke="#E9B824" strokeWidth="5.5" />
      <circle cx={cx} cy={pendantY} r="4.5" fill="#E9B824" stroke="#B8860B" strokeWidth="1.5" />
    </g>
  );
};

// -------------------------------------------------------------
// TÚI TOTE: in sprite pixel coordinates (inside sprite inner group)
// Hanging from sprite.hands.viewerRight
// -------------------------------------------------------------

export const TuiToteSprite: React.FC<{ sprite: OutfitSprite }> = ({ sprite }) => {
  const hand = sprite.hands.viewerRight;
  const bagX = hand.x - 60;
  const bagY = hand.y + 24;
  const printCx = hand.x;
  const printCy = bagY + 65;

  return (
    <g data-part="acc-tui-tote">
      {/* Two handle strokes from bag top corners curving up towards hand without covering hand */}
      <path
        d={`M${bagX + 22} ${bagY} Q${hand.x - 16} ${hand.y + 16} ${hand.x - 4} ${hand.y + 10}`}
        fill="none"
        stroke="#1E1B18"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={`M${bagX + 98} ${bagY} Q${hand.x + 16} ${hand.y + 16} ${hand.x + 4} ${hand.y + 10}`}
        fill="none"
        stroke="#1E1B18"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Bag body: rect 120 x 130, rx 8 */}
      <rect
        x={bagX}
        y={bagY}
        width="120"
        height="130"
        rx="8"
        fill="#F4EBD9"
        stroke="#1E1B18"
        strokeWidth="3"
      />
      {/* Red circle print: r 22 */}
      <circle cx={printCx} cy={printCy} r="22" fill="#D9442B" />
    </g>
  );
};

export const TuiToteSvg: React.FC<{ sX?: number; sT?: number }> = ({ sX = 1, sT = 1 }) => {
  // SVG hand position (viewer right = character left): cx = 282, cy = 408
  const handX = 282 + 82 * (sX - 1);
  const handY = 408 + 67 * (sT - 1);
  const bagX = handX - 30;
  const bagY = handY + 12;

  return (
    <g data-part="acc-tui-tote-svg">
      <path
        d={`M${bagX + 11} ${bagY} Q${handX - 8} ${handY + 8} ${handX - 3} ${handY + 5}`}
        fill="none"
        stroke="#1E1B18"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d={`M${bagX + 49} ${bagY} Q${handX + 8} ${handY + 8} ${handX + 3} ${handY + 5}`}
        fill="none"
        stroke="#1E1B18"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x={bagX}
        y={bagY}
        width="60"
        height="65"
        rx="5"
        fill="#F4EBD9"
        stroke="#1E1B18"
        strokeWidth="2"
      />
      <circle cx={handX} cy={bagY + 32.5} r="11" fill="#D9442B" />
    </g>
  );
};

export interface CharacterAccessoriesProps {
  selectedIds: Set<string> | string[];
}

export const CharacterAccessories: React.FC<CharacterAccessoriesProps> = ({ selectedIds }) => {
  const ids = Array.isArray(selectedIds) ? new Set(selectedIds) : selectedIds;
  return (
    <g data-part="character-accessories">
      {ids.has('khan-xep') && <KhanXep />}
      {ids.has('khan-mo-qua') && <KhanMoQua />}
      {ids.has('non-quai-thao') && <NonQuaiThao />}
      {ids.has('khan-ran') && <KhanRan />}
    </g>
  );
};

export default CharacterAccessories;
