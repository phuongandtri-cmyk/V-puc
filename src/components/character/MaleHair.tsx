// ============================================================================
// MaleHair.tsx — SINGLE SOURCE OF TRUTH for the 4 MALE hairstyles (version v6-final)
// Copy this file VERBATIM. Do not edit, round, simplify or re-measure any path.
// Coordinates are in the character SVG space: viewBox "0 -50 400 650",
// head ellipse centre (200,172), rx 92, ry 90. No transform is needed.
// ============================================================================
import React from "react";

export const MALE_HAIR_VERSION = "v6.3-final";

export type MaleHairId = "textured-quiff" | "messy-fringe" | "half-up-bun" | "low-ponytail";
export const DEFAULT_MALE_HAIR: MaleHairId = "textured-quiff";

type Tie = { x: number; y: number; width: number; height: number; rx: number; transform?: string };
type Layer = {
  fade?: string[]; shapes?: string[]; strands?: string[]; inkStrokes?: string[];
  highlights?: string[]; wisps?: string[]; loose?: string[]; part?: string[]; ties?: Tie[];
};
type Style = { id: MaleHairId; label: string; back: Layer; front: Layer };

const INK = "#1E1B18";

const STYLES: Style[] = [
 {
  "id": "textured-quiff",
  "label": "Textured Quiff",
  "back": {},
  "front": {
   "fade": [
    "M129 178 L108 178 L108 172 L108 166 L109 160 L110 154 L111 148 L113 142 L116 136 L119 130 L122 124 L126 118 L129 118 Z",
    "M271 178 L292 178 L292 172 L292 166 L291 160 L290 154 L289 148 L287 142 L284 136 L281 130 L278 124 L274 118 L271 118 Z"
   ],
   "shapes": [
    "M104 152 C88 110 104 60 158 46 C206 34 264 44 292 80 C310 104 306 134 292 152 C282 140 270 134 262 136 C252 126 240 122 228 124 C214 116 200 114 188 120 C174 122 160 126 148 132 C136 140 122 148 104 152 Z",
    "M98 122 Q88 129 80 128 Q91 141 104 146 Z",
    "M100 96 Q91 94 82 86 Q96 85 110 78 Z",
    "M122 62 Q118 54 120 40 Q131 48 148 50 Z",
    "M160 46 Q159 36 166 22 Q174 32 190 38 Z",
    "M196 38 Q218 31 228 16 Q235 32 230 40 Z",
    "M236 44 Q260 43 276 32 Q275 50 266 58 Z",
    "M280 68 Q299 75 316 74 Q308 89 298 96 Z",
    "M296 104 Q308 114 320 118 Q311 128 302 132 Z",
    "M280 140 Q280 154 292 166 Q288 148 296 128 Z",
    "M150 128 Q162 151 148 162 Q176 147 178 120 Z"
   ],
   "strands": [
    "M150 124 C162 98 186 82 220 76",
    "M176 118 C194 100 222 92 256 96",
    "M128 112 C138 88 158 72 184 62",
    "M232 116 C252 108 272 112 288 124"
   ],
   "highlights": [
    "M140 96 Q168 73 206 64 Q164 67 140 96 Z",
    "M212 84 Q251 83 282 98 Q253 77 212 84 Z",
    "M158 120 Q173 110 194 104 Q171 106 158 120 Z"
   ]
  }
 },
 {
  "id": "messy-fringe",
  "label": "Messy Fringe",
  "back": {},
  "front": {
   "shapes": [
    "M98 184 C80 124 110 58 172 46 C232 36 294 60 308 120 C314 150 308 172 300 184 L286 168 L282 128 L118 128 L114 168 Z",
    "M110 124 Q124 154 116 180 Q142 154 146 124 Z",
    "M136 124 Q148 149 148 172 Q166 149 172 124 Z",
    "M150 124 Q155 138 158 152 Q166 138 172 124 Z",
    "M164 124 Q172 145 176 166 Q190 145 200 124 Z",
    "M190 124 Q194 150 202 176 Q210 150 222 124 Z",
    "M212 124 Q217 138 224 152 Q226 138 230 124 Z",
    "M216 124 Q220 145 232 166 Q236 145 248 124 Z",
    "M240 124 Q240 149 254 174 Q256 149 272 124 Z",
    "M262 124 Q262 155 286 182 Q277 155 292 124 Z",
    "M96 150 Q108 173 108 198 Q116 184 112 172 Z",
    "M304 150 Q292 173 292 198 Q284 184 288 172 Z",
    "M92 116 Q82 122 76 120 Q85 134 98 140 Z",
    "M112 86 Q100 84 90 72 Q108 76 128 70 Z",
    "M308 112 Q319 118 326 116 Q316 131 302 138 Z",
    "M288 72 Q304 74 316 70 Q310 85 300 94 Z",
    "M172 48 Q170 38 180 26 Q181 36 194 44 Z",
    "M200 44 Q216 38 218 24 Q223 39 214 46 Z",
    "M230 50 Q247 47 256 36 Q256 50 248 56 Z"
   ],
   "strands": [
    "M140 128 C146 104 162 84 186 72",
    "M176 128 C180 106 192 88 210 78",
    "M230 128 C232 108 244 92 262 84",
    "M262 130 C270 116 284 108 296 110"
   ],
   "highlights": [
    "M120 108 Q140 83 176 70 Q136 77 120 108 Z",
    "M226 66 Q264 75 288 102 Q268 69 226 66 Z",
    "M186 92 Q204 84 220 86 Q204 80 186 92 Z"
   ]
  }
 },
 {
  "id": "half-up-bun",
  "label": "Tóc buộc nửa đầu",
  "back": {
   "shapes": [
    "M110 110 C88 160 86 240 94 318 L104 300 L112 320 L122 298 L132 314 L142 296 L258 296 L268 314 L278 298 L288 320 L296 300 L306 318 C314 240 312 160 290 110 Z"
   ],
   "strands": [
    "M104 180 C100 230 102 270 106 300",
    "M296 180 C300 230 298 270 294 300",
    "M120 200 C118 240 120 280 124 300",
    "M280 200 C282 240 280 280 276 300"
   ],
   "highlights": [
    "M100 200 Q93 240 104 280 Q99 240 100 200 Z",
    "M300 200 Q301 240 296 280 Q307 240 300 200 Z"
   ]
  },
  "front": {
   "shapes": [
    "M178 60 C176 42 190 32 202 33 C218 34 226 48 222 62 C220 74 206 80 196 78 C184 76 179 70 178 60 Z",
    "M200 72 C150 70 104 98 98 150 C94 180 98 210 104 236 L112 220 L116 232 C116 206 116 186 122 172 C130 154 150 140 176 136 C188 134 196 138 200 142 C204 138 212 134 224 136 C250 140 270 154 278 172 C284 186 284 206 284 232 L288 220 L296 236 C302 210 306 180 302 150 C296 98 250 70 200 72 Z"
   ],
   "strands": [
    "M200 142 C196 116 196 96 200 80",
    "M178 138 C176 112 184 92 194 80",
    "M156 144 C152 118 166 94 188 80",
    "M134 158 C130 128 146 100 182 82",
    "M222 138 C224 112 216 92 206 80",
    "M244 144 C248 118 234 94 212 80",
    "M266 158 C270 128 254 100 218 82"
   ],
   "highlights": [
    "M126 140 Q141 104 176 86 Q135 100 126 140 Z",
    "M274 140 Q265 100 224 86 Q259 104 274 140 Z",
    "M188 44 Q200 40 214 44 Q200 36 188 44 Z"
   ],
   "loose": [
    "M118 176 C108 200 106 228 112 256",
    "M282 176 C292 200 294 228 288 256"
   ],
   "ties": [
    {
     "x": 186,
     "y": 74,
     "width": 28,
     "height": 8,
     "rx": 4
    }
   ]
  }
 },
 {
  "id": "low-ponytail",
  "label": "Tóc đuôi ngựa",
  "back": {
   "shapes": [
    "M94 212 C78 166 80 104 122 70 C142 54 162 44 180 44 C190 44 196 46 200 51 C204 46 210 44 220 44 C238 44 258 54 278 70 C320 104 322 166 306 212 Z"
   ],
   "inkStrokes": [
    "M124 150 Q101 169 96 196 Q103 171 124 150 Z",
    "M276 150 Q297 171 304 196 Q299 169 276 150 Z"
   ],
   "highlights": [
    "M116 162 Q100 179 100 200 Q104 181 116 162 Z",
    "M284 162 Q296 181 300 200 Q300 179 284 162 Z"
   ]
  },
  "front": {
   "shapes": [
    "M200 51 C204 46 210 44 220 44 C238 44 258 54 278 70 C310 96 316 134 308 166 C304 178 296 184 288 188 C284 160 270 134 246 120 C230 112 214 112 200 118 C186 112 170 112 154 120 C130 134 116 160 112 188 C104 184 96 178 92 166 C84 134 90 96 122 70 C142 54 162 44 180 44 C190 44 196 46 200 51 Z",
    "M224 260 C234 258 244 254 254 246 C272 254 286 270 290 288 C294 302 290 316 282 328 C282 312 276 300 266 291 C254 281 238 272 224 260 Z",
    "M256 250 Q271 287 298 318 Q281 293 276 262 Z",
    "M232 262 Q255 291 268 324 Q264 292 250 264 Z"
   ],
   "inkStrokes": [
    "M196 60 Q155 61 128 96 Q157 63 196 60 Z",
    "M186 122 Q125 104 100 150 Q127 108 186 122 Z",
    "M168 120 Q120 99 98 128 Q120 101 168 120 Z",
    "M204 60 Q243 63 272 96 Q245 61 204 60 Z",
    "M214 122 Q273 108 300 150 Q275 104 214 122 Z",
    "M232 120 Q280 101 302 128 Q280 99 232 120 Z",
    "M238 266 Q261 289 278 322 Q263 287 238 266 Z",
    "M254 258 Q281 277 292 310 Q283 275 254 258 Z"
   ],
   "highlights": [
    "M182 52 Q143 53 120 82 Q145 59 182 52 Z",
    "M218 52 Q255 59 280 82 Q257 53 218 52 Z",
    "M150 96 Q115 104 104 138 Q117 108 150 96 Z",
    "M250 96 Q283 108 296 138 Q285 104 250 96 Z",
    "M260 266 Q283 281 288 304 Q285 279 260 266 Z",
    "M172 66 Q127 75 110 108 Q129 77 172 66 Z",
    "M228 66 Q271 77 290 108 Q273 75 228 66 Z",
    "M142 104 Q105 115 94 150 Q107 117 142 104 Z",
    "M258 104 Q293 117 306 150 Q295 115 258 104 Z",
    "M130 130 Q99 145 92 178 Q101 147 130 130 Z",
    "M270 130 Q299 147 308 178 Q301 145 270 130 Z"
   ],
   "wisps": [
    "M116 156 Q87 219 108 280 Q105 221 116 156 Z",
    "M284 156 Q296 207 296 256 Q312 205 284 156 Z"
   ],
   "part": [
    "M200 116 C199 96 199 72 200 53"
   ]
  }
 }
];

// ---- PATCH v6.3 — Messy Fringe: remove the sticking-out corners of 2 locks ----
// Matches shapes by their FIRST POINT, so it works whatever the formatting of the paths.
const MESSY_FRINGE_PATCH_V63: { starts: string[]; d: string }[] = [
  // lock #1 from the LEFT (left temple): new smooth base, same tip
  { starts: ["M 92 116", "M 96 112", "M 94 118"], d: "M102 110 Q88 118 76 120 Q89 133 104 140 Z" },
  // lock #2 from the RIGHT (upper right): base attached inside the hair, same tip
  { starts: ["M 288 72"], d: "M278 70 Q298 72 316 70 Q306 87 294 100 Z" },
  // lower right side lock: restore the original v6 shape (undo v6.1 / v6.2 if applied)
  { starts: ["M 304 108", "M 306 114"], d: "M308 112 Q319 118 326 116 Q316 131 302 138 Z" },
];
(() => {
  const fringe = STYLES.find(s => s.id === "messy-fringe");
  if (!fringe || !fringe.front.shapes) return;
  const norm = (d: string) => d.replace(/([A-Za-z])/g, " $1 ").replace(/[\s,]+/g, " ").trim();
  fringe.front.shapes = fringe.front.shapes.map(d => {
    const n = norm(d) + " ";
    const hit = MESSY_FRINGE_PATCH_V63.find(p => p.starts.some(s => n.startsWith(s + " ")));
    return hit ? hit.d : d;
  });
})();
// ---- end PATCH v6.3 ----

/** Buttons for the "KIỂU TÓC" row when gender = Nam, in this exact order. */
export const MALE_HAIRSTYLE_OPTIONS: { id: MaleHairId; label: string }[] =
  STYLES.map(s => ({ id: s.id, label: s.label }));

/** Any unknown / old id (e.g. "toc-ngan-gon", "toc-vuot", "bui-to") falls back to the default. */
export function normalizeMaleHairId(id: string | undefined | null): MaleHairId {
  return (STYLES.some(s => s.id === id) ? id : DEFAULT_MALE_HAIR) as MaleHairId;
}

function renderLayer(layer: Layer, color: string, key: string) {
  const L = (a?: string[]) => a ?? [];
  const nss = { vectorEffect: "non-scaling-stroke" as const };
  return (
    <>
      {L(layer.fade).map((d, i) => <path key={`${key}f${i}`} d={d} fill={color} opacity={0.8} />)}
      {/* OUTLINE PASS: one dark silhouette behind the fill */}
      {L(layer.shapes).map((d, i) => (
        <path key={`${key}o${i}`} d={d} fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" {...nss} />
      ))}
      {/* FILL PASS: paints over inner outlines so only the outer edge stays dark */}
      {L(layer.shapes).map((d, i) => <path key={`${key}s${i}`} d={d} fill={color} />)}
      {L(layer.strands).map((d, i) => (
        <path key={`${key}t${i}`} d={d} fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={1.5} strokeLinecap="round" {...nss} />
      ))}
      {L(layer.inkStrokes).map((d, i) => <path key={`${key}k${i}`} d={d} fill={INK} opacity={0.55} />)}
      {L(layer.highlights).map((d, i) => <path key={`${key}h${i}`} d={d} fill="#FFFFFF" opacity={0.3} />)}
      {L(layer.wisps).map((d, i) => <path key={`${key}w${i}`} d={d} fill={color} />)}
      {L(layer.loose).map((d, i) => (
        <path key={`${key}l${i}`} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" {...nss} />
      ))}
      {L(layer.part).map((d, i) => (
        <path key={`${key}p${i}`} d={d} fill="none" stroke={INK} strokeOpacity={0.6} strokeWidth={1.5} strokeLinecap="round" {...nss} />
      ))}
      {(layer.ties ?? []).map((t, i) => (
        <rect key={`${key}r${i}`} x={t.x} y={t.y} width={t.width} height={t.height} rx={t.rx} transform={t.transform}
          fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" {...nss} />
      ))}
    </>
  );
}

type HairProps = { styleId: string; color: string };

/** Render INSIDE the character SVG, ABOVE the shadow and BELOW the neck/body. */
export function MaleHairBack({ styleId, color }: HairProps) {
  const s = STYLES.find(x => x.id === normalizeMaleHairId(styleId))!;
  return <g data-hair-layer="back" data-hair-version={MALE_HAIR_VERSION} data-hair-id={s.id}>{renderLayer(s.back, color, "b")}</g>;
}

/** Render INSIDE the character SVG, ABOVE the face and BELOW headwear. */
export function MaleHairFront({ styleId, color }: HairProps) {
  const s = STYLES.find(x => x.id === normalizeMaleHairId(styleId))!;
  return <g data-hair-layer="front" data-hair-version={MALE_HAIR_VERSION} data-hair-id={s.id}>{renderLayer(s.front, color, "f")}</g>;
}
