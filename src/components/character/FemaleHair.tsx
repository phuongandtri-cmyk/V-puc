// ============================================================================
// FemaleHair.tsx — SINGLE SOURCE OF TRUTH for the 4 FEMALE hairstyles (version f2-final)
// Copy this file VERBATIM. Do not edit, round, simplify or re-measure any path.
// Coordinates are in the character SVG space: viewBox "0 -50 400 650",
// head ellipse centre (200,172), rx 92, ry 90. No transform is needed.
// Ornament colours (gold / red) are fixed; hair colour comes from the "Màu tóc" picker.
// ============================================================================
import React from "react";

export const FEMALE_HAIR_VERSION = "f2-final";

export type FemaleHairId = "bui-thap-truyen-thong" | "van-toc-cai-tram" | "bui-cao-cung-dinh" | "toc-dai-co-dien";
export const DEFAULT_FEMALE_HAIR: FemaleHairId = "bui-thap-truyen-thong";

type Ornament = { d: string; fill?: string; stroke?: string; width?: number };
type Layer = {
  shapes?: string[]; strands?: string[]; inkStrokes?: string[]; highlights?: string[];
  wisps?: string[]; loose?: string[]; part?: string[]; ornaments?: Ornament[];
};
type Style = { id: FemaleHairId; label: string; back: Layer; front: Layer };

const INK = "#1E1B18";

const STYLES: Style[] = [
 {
  "id": "bui-thap-truyen-thong",
  "label": "Búi thấp truyền thống",
  "back": {
   "shapes": [
    "M140 236 C110 230 88 196 90 140 C92 104 104 88 124 76 C148 56 172 50 200 50 C228 50 252 56 276 76 C296 88 308 104 310 140 C312 196 290 230 260 236 Z",
    "M262 214 C266 190 292 180 314 190 C336 200 340 230 330 250 C320 270 292 274 274 262 C262 254 258 232 262 214 Z"
   ],
   "inkStrokes": [
    "M276 206 Q307 194 330 226 Q309 190 276 206 Z",
    "M276 232 Q306 225 332 240 Q306 223 276 232 Z",
    "M280 254 Q304 267 326 252 Q304 265 280 254 Z"
   ],
   "highlights": [
    "M288 200 Q305 198 322 210 Q307 194 288 200 Z"
   ]
  },
  "front": {
   "shapes": [
    "M106 194 C84 164 84 104 122 72 C146 52 172 44 200 44 C228 44 254 52 278 72 C316 104 316 164 294 200 C286 168 272 136 248 124 C232 116 198 114 186 118 C174 114 168 116 152 124 C128 136 114 164 108 194 Z"
   ],
   "inkStrokes": [
    "M182 114 Q139 111 122 160 Q141 113 182 114 Z",
    "M178 90 Q139 83 112 130 Q141 85 178 90 Z",
    "M190 114 Q261 113 278 160 Q263 111 190 114 Z",
    "M194 90 Q261 85 288 130 Q263 83 194 90 Z",
    "M236 128 Q283 151 296 196 Q285 149 236 128 Z"
   ],
   "highlights": [
    "M172 84 Q144 86 126 118 Q148 90 172 84 Z",
    "M200 84 Q253 91 274 118 Q255 85 200 84 Z"
   ],
   "wisps": [
    "M110 172 Q92 216 100 262 Q96 216 110 172 Z",
    "M290 178 Q302 220 296 262 Q306 220 290 178 Z"
   ],
   "part": [
    "M186 118 C187 100 190 86 194 76"
   ]
  }
 },
 {
  "id": "van-toc-cai-tram",
  "label": "Vấn tóc cài trâm",
  "back": {
   "shapes": [
    "M140 236 C110 230 88 196 90 140 C92 104 104 88 124 76 C148 56 172 50 200 50 C228 50 252 56 276 76 C296 88 308 104 310 140 C312 196 290 230 260 236 Z",
    "M146 58 C138 20 170 -8 214 -8 C258 -8 288 20 282 56 C278 76 250 84 214 82 C178 82 152 78 146 58 Z"
   ],
   "inkStrokes": [
    "M158 46 Q210 8 270 26 Q210 4 158 46 Z",
    "M166 64 Q224 37 276 44 Q224 35 166 64 Z",
    "M190 8 Q222 -3 252 4 Q222 -5 190 8 Z"
   ],
   "highlights": [
    "M172 24 Q201 7 240 4 Q199 1 172 24 Z"
   ]
  },
  "front": {
   "shapes": [
    "M106 194 C84 164 84 104 122 72 C146 52 172 44 200 44 C228 44 254 52 278 72 C316 104 316 164 294 194 C286 164 272 136 248 124 C232 116 212 114 200 120 C188 114 168 116 152 124 C128 136 114 164 108 194 Z"
   ],
   "inkStrokes": [
    "M196 116 Q139 111 122 160 Q141 113 196 116 Z",
    "M192 90 Q139 83 112 130 Q141 85 192 90 Z",
    "M204 116 Q261 113 278 160 Q263 111 204 116 Z",
    "M208 90 Q261 85 288 130 Q263 83 208 90 Z"
   ],
   "highlights": [
    "M186 84 Q145 86 126 118 Q147 90 186 84 Z",
    "M214 84 Q253 90 274 118 Q255 86 214 84 Z"
   ],
   "wisps": [
    "M112 168 Q95 210 104 252 Q101 210 112 168 Z",
    "M288 168 Q299 210 296 252 Q305 210 288 168 Z"
   ],
   "part": [
    "M200 120 C199 100 199 80 200 64"
   ],
   "ornaments": [
    {
     "d": "M166 60 L292 44",
     "stroke": "#E9B824",
     "width": 5
    },
    {
     "d": "M292 46 L292 96",
     "stroke": "#B8860B",
     "width": 1.5
    },
    {
     "d": "M286.2 34 a7.8 7.8 0 1 0 15.6 0 a7.8 7.8 0 1 0 -15.6 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M295.7 40.9 a7.8 7.8 0 1 0 15.6 0 a7.8 7.8 0 1 0 -15.6 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M292.1 52.1 a7.8 7.8 0 1 0 15.6 0 a7.8 7.8 0 1 0 -15.6 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M280.3 52.1 a7.8 7.8 0 1 0 15.6 0 a7.8 7.8 0 1 0 -15.6 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M276.7 40.9 a7.8 7.8 0 1 0 15.6 0 a7.8 7.8 0 1 0 -15.6 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M288.5 44 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M287 100 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M288 112 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M288 122 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z",
     "fill": "#E9B824"
    }
   ]
  }
 },
 {
  "id": "bui-cao-cung-dinh",
  "label": "Búi cao cung đình",
  "back": {
   "shapes": [
    "M140 236 C110 230 88 196 90 140 C92 104 104 88 124 76 C148 56 172 50 200 50 C228 50 252 56 276 76 C296 88 308 104 310 140 C312 196 290 230 260 236 Z",
    "M134 38 C128 6 160 -14 202 -14 C246 -14 276 6 270 38 C266 58 240 66 202 66 C164 66 138 58 134 38 Z",
    "M166 -4 C164 -28 182 -44 202 -44 C224 -44 240 -28 238 -4 C236 10 222 16 202 16 C182 16 168 10 166 -4 Z"
   ],
   "inkStrokes": [
    "M142 34 Q202 14 262 34 Q202 10 142 34 Z",
    "M172 -12 Q202 -27 232 -12 Q202 -29 172 -12 Z"
   ],
   "highlights": [
    "M152 18 Q177 -1 222 -6 Q175 -7 152 18 Z",
    "M176 -26 Q195 -34 216 -36 Q193 -38 176 -26 Z"
   ]
  },
  "front": {
   "shapes": [
    "M106 194 C84 164 84 104 122 72 C146 52 172 44 200 44 C228 44 254 52 278 72 C316 104 316 164 294 194 C286 164 272 136 248 124 C232 116 212 114 200 120 C188 114 168 116 152 124 C128 136 114 164 108 194 Z"
   ],
   "inkStrokes": [
    "M196 116 Q139 111 122 160 Q141 113 196 116 Z",
    "M192 90 Q139 83 112 130 Q141 85 192 90 Z",
    "M204 116 Q261 113 278 160 Q263 111 204 116 Z",
    "M208 90 Q261 85 288 130 Q263 83 208 90 Z"
   ],
   "highlights": [
    "M186 84 Q145 86 126 118 Q147 90 186 84 Z",
    "M214 84 Q253 90 274 118 Q255 86 214 84 Z"
   ],
   "wisps": [
    "M112 168 Q95 210 104 252 Q101 210 112 168 Z",
    "M288 168 Q299 210 296 252 Q305 210 288 168 Z"
   ],
   "part": [
    "M200 120 C199 104 199 90 200 70"
   ],
   "ornaments": [
    {
     "d": "M189.9 27 a10.1 10.1 0 1 0 20.2 0 a10.1 10.1 0 1 0 -20.2 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M201.2 33.5 a10.1 10.1 0 1 0 20.2 0 a10.1 10.1 0 1 0 -20.2 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M201.2 46.5 a10.1 10.1 0 1 0 20.2 0 a10.1 10.1 0 1 0 -20.2 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M189.9 53 a10.1 10.1 0 1 0 20.2 0 a10.1 10.1 0 1 0 -20.2 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M178.6 46.5 a10.1 10.1 0 1 0 20.2 0 a10.1 10.1 0 1 0 -20.2 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M178.6 33.5 a10.1 10.1 0 1 0 20.2 0 a10.1 10.1 0 1 0 -20.2 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M192.8 40 a7.2 7.2 0 1 0 14.4 0 a7.2 7.2 0 1 0 -14.4 0 Z",
     "fill": "#C8371F"
    },
    {
     "d": "M121.8 78 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M129.4 83.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M126.5 92.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M117.1 92.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M114.2 83.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M123.6 86 a4.4 4.4 0 1 0 8.8 0 a4.4 4.4 0 1 0 -8.8 0 Z",
     "fill": "#B8860B"
    },
    {
     "d": "M267.8 80 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M275.4 85.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M272.5 94.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M263.1 94.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M260.2 85.5 a6.2 6.2 0 1 0 12.4 0 a6.2 6.2 0 1 0 -12.4 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M269.6 88 a4.4 4.4 0 1 0 8.8 0 a4.4 4.4 0 1 0 -8.8 0 Z",
     "fill": "#B8860B"
    },
    {
     "d": "M242 20 L306 8",
     "stroke": "#E9B824",
     "width": 5
    },
    {
     "d": "M296 10 L296 74",
     "stroke": "#B8860B",
     "width": 1.5
    },
    {
     "d": "M293.5 74 h5 v8 h-5 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M304 10 L304 84",
     "stroke": "#B8860B",
     "width": 1.5
    },
    {
     "d": "M301.5 84 h5 v8 h-5 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M312 10 L312 70",
     "stroke": "#B8860B",
     "width": 1.5
    },
    {
     "d": "M309.5 70 h5 v8 h-5 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M300.5 1 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M307.2 5.8 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M304.6 13.7 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M296.4 13.7 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M293.8 5.8 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z",
     "fill": "#E9B824"
    },
    {
     "d": "M302.1 8 a3.9 3.9 0 1 0 7.8 0 a3.9 3.9 0 1 0 -7.8 0 Z",
     "fill": "#C8371F"
    }
   ]
  }
 },
 {
  "id": "toc-dai-co-dien",
  "label": "Tóc dài cổ điển",
  "back": {
   "shapes": [
    "M140 150 C150 210 150 260 156 300 L244 300 C250 260 250 210 260 150 Z",
    "M140 236 C110 230 88 196 90 140 C92 104 104 88 124 76 C148 56 172 50 200 50 C228 50 252 56 276 76 C296 88 308 104 310 140 C312 196 290 230 260 236 Z",
    "M150 110 C118 120 96 146 92 196 C88 232 70 256 78 294 C86 330 112 348 100 390 C90 424 72 446 92 472 Q100 484 88 498 Q108 492 112 474 Q118 486 116 500 Q132 490 132 470 Q140 480 146 486 C144 460 136 434 144 404 C152 372 140 344 148 304 C152 270 158 240 170 214 Z",
    "M 250 110 C 282 120 304 146 308 196 C 312 232 330 256 322 294 C 314 330 288 348 300 390 C 310 424 328 446 308 472 Q 300 484 312 498 Q 292 492 288 474 Q 282 486 284 500 Q 268 490 268 470 Q 260 480 254 486 C 256 460 264 434 256 404 C 248 372 260 344 252 304 C 248 270 242 240 230 214 Z",
    "M96 298 C112 326 124 350 114 390 C104 426 100 448 118 474 Q102 462 96 434 C90 404 106 382 102 354 C98 330 86 318 96 298 Z",
    "M 304 298 C 288 326 276 350 286 390 C 296 426 300 448 282 474 Q 298 462 304 434 C 310 404 294 382 298 354 C 302 330 314 318 304 298 Z"
   ],
   "inkStrokes": [
    "M98 206 Q74 252 88 296 Q78 252 98 206 Z",
    "M88 300 Q114 340 104 388 Q118 340 88 300 Z",
    "M104 394 Q79 432 96 468 Q81 432 104 394 Z",
    "M126 226 Q103 270 116 316 Q105 270 126 226 Z",
    "M118 322 Q139 368 130 420 Q141 368 118 322 Z",
    "M302 206 Q322 252 312 296 Q326 252 302 206 Z",
    "M312 300 Q282 340 296 388 Q286 340 312 300 Z",
    "M296 394 Q319 432 304 468 Q321 432 296 394 Z",
    "M274 226 Q295 270 284 316 Q297 270 274 226 Z",
    "M282 322 Q259 368 270 420 Q261 368 282 322 Z"
   ],
   "highlights": [
    "M92 232 Q77 260 86 288 Q83 260 92 232 Z",
    "M100 336 Q112 360 106 384 Q116 360 100 336 Z",
    "M90 430 Q82 446 92 462 Q86 446 90 430 Z",
    "M308 232 Q317 260 314 288 Q323 260 308 232 Z",
    "M300 336 Q284 360 294 384 Q288 360 300 336 Z",
    "M310 430 Q314 446 308 462 Q318 446 310 430 Z"
   ]
  },
  "front": {
   "shapes": [
    "M106 194 C84 164 84 104 122 72 C146 52 172 44 200 44 C228 44 254 52 278 72 C316 104 316 164 294 194 C286 164 272 136 248 124 C232 116 212 114 200 120 C188 114 168 116 152 124 C128 136 114 164 108 194 Z"
   ],
   "inkStrokes": [
    "M196 116 Q139 111 122 160 Q141 113 196 116 Z",
    "M192 90 Q139 83 112 130 Q141 85 192 90 Z",
    "M204 116 Q261 113 278 160 Q263 111 204 116 Z",
    "M208 90 Q261 85 288 130 Q263 83 208 90 Z"
   ],
   "highlights": [
    "M186 84 Q145 86 126 118 Q147 90 186 84 Z",
    "M214 84 Q253 90 274 118 Q255 86 214 84 Z"
   ],
   "wisps": [
    "M112 172 Q89 201 100 238 Q95 203 112 172 Z",
    "M100 236 Q118 268 112 302 Q122 268 100 236 Z",
    "M288 172 Q305 203 300 238 Q311 201 288 172 Z",
    "M300 236 Q278 268 288 302 Q282 268 300 236 Z"
   ],
   "part": [
    "M200 120 C199 104 199 86 200 70"
   ]
  }
 }
];

/** Buttons for the "KIỂU TÓC" row when gender = Nữ, in this exact order. */
export const FEMALE_HAIRSTYLE_OPTIONS: { id: FemaleHairId; label: string }[] =
  STYLES.map(s => ({ id: s.id, label: s.label }));

/** Any unknown / old id (e.g. "Búi tóc", "Tóc dài buông", "Buộc đuôi ngựa", "Tóc ngắn") falls back to the default. */
export function normalizeFemaleHairId(id: string | undefined | null): FemaleHairId {
  return (STYLES.some(s => s.id === id) ? id : DEFAULT_FEMALE_HAIR) as FemaleHairId;
}

function renderLayer(layer: Layer, color: string, key: string) {
  const L = (a?: string[]) => a ?? [];
  const nss = { vectorEffect: "non-scaling-stroke" as const };
  return (
    <>
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
      {(layer.ornaments ?? []).map((o, i) =>
        o.stroke ? (
          <path key={`${key}n${i}`} d={o.d} fill="none" stroke={o.stroke} strokeWidth={o.width ?? 2} strokeLinecap="round" />
        ) : (
          <path key={`${key}n${i}`} d={o.d} fill={o.fill} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" {...nss} />
        )
      )}
    </>
  );
}

type HairProps = { styleId: string; color: string };

/** Render INSIDE the character SVG, ABOVE the shadow and BELOW the neck/body. */
export function FemaleHairBack({ styleId, color }: HairProps) {
  const s = STYLES.find(x => x.id === normalizeFemaleHairId(styleId))!;
  return <g data-hair-layer="back" data-hair-version={FEMALE_HAIR_VERSION} data-hair-id={s.id}>{renderLayer(s.back, color, "b")}</g>;
}

/** Render INSIDE the character SVG, ABOVE the face and BELOW headwear. */
export function FemaleHairFront({ styleId, color }: HairProps) {
  const s = STYLES.find(x => x.id === normalizeFemaleHairId(styleId))!;
  return <g data-hair-layer="front" data-hair-version={FEMALE_HAIR_VERSION} data-hair-id={s.id}>{renderLayer(s.front, color, "f")}</g>;
}
