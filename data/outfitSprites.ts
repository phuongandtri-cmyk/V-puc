// outfitSprites.ts — Lớp trang phục dạng ảnh (sprite) cho nhân vật chibi.
// Ảnh do Gemini vẽ theo ảnh phục dựng; đội đã tách đầu, tách vùng vải (để đổi màu) và vùng da (để đổi màu da).
// v3: thêm tọa độ bàn tay (hands). v2: mọi bộ đã chuẩn hóa cùng chiều dài thân (từ cổ đến chân = 646 px khi mặt r = 180).
// Cách ghép: căn tâm và bán kính khuôn mặt (face) của sprite trùng với khuôn mặt SVG của nhân vật.

export const SPRITE_BASE_URL = "https://cdn.jsdelivr.net/gh/phuongandtri-cmyk/viet-phuc-remix@main/sprites-v3/";

export interface SpriteOverlay {
  file: string;   // ảnh phủ lên trên (không đổi màu)
  x: number;      // vị trí góc trên-trái, theo px của sprite
  y: number;
  width: number;
  height: number;
}

export interface OutfitSprite {
  file: string;          // ảnh chính: vùng vải và vùng da đã chuyển sang xám/trắng để nhân màu
  fabricMask: string;    // mặt nạ vùng vải chính (trắng + alpha)
  skinMask: string;      // mặt nạ vùng da: cổ, bàn tay (trắng + alpha)
  width: number;         // kích thước ảnh (px)
  height: number;
  face: { cx: number; cy: number; r: number }; // tâm và bán kính mặt, theo px của ảnh (cy âm = nằm trên mép ảnh)
  neckY: number;         // vị trí cằm/cổ theo px của ảnh — làm gốc khi co giãn theo chiều cao, cân nặng
  defaultFabric: string; // màu vải gốc
  hands: { viewerLeft: { x: number; y: number }; viewerRight: { x: number; y: number } }; // tâm bàn tay theo px của sprite (trái/phải theo người xem) — dùng để gắn túi
  overlays?: Record<string, SpriteOverlay>; // khóa = id họa tiết trong stylingOptions (vd "bo-tu-hac"): chỉ hiện khi người dùng chọn họa tiết đó
}

export const outfitSprites: Record<string, Partial<Record<"nam" | "nu", OutfitSprite>>> = {
  "giao-linh": {
    nam: { file: "giao-linh_nam_shade.webp", fabricMask: "giao-linh_nam_fabric.webp", skinMask: "giao-linh_nam_skin.webp", width: 517, height: 713, face: { cx: 251.8, cy: -110.3, r: 180 }, neckY: 66.8, hands: { viewerLeft: { x: 87.5, y: 388.8 }, viewerRight: { x: 429.2, y: 388.8 } }, defaultFabric: "#26417A" },
    nu: { file: "giao-linh_nu_shade.webp", fabricMask: "giao-linh_nu_fabric.webp", skinMask: "giao-linh_nu_skin.webp", width: 505, height: 711, face: { cx: 248.8, cy: -112.0, r: 180 }, neckY: 65.5, hands: { viewerLeft: { x: 51.4, y: 391.2 }, viewerRight: { x: 452.4, y: 389.8 } }, defaultFabric: "#C1262A" },
  },
  "vien-linh": {
    nam: { file: "vien-linh_nam_shade.webp", fabricMask: "vien-linh_nam_fabric.webp", skinMask: "vien-linh_nam_skin.webp", width: 495, height: 707, face: { cx: 246.1, cy: -115.2, r: 180 }, neckY: 61.2, hands: { viewerLeft: { x: 122.4, y: 362.0 }, viewerRight: { x: 371.4, y: 362.0 } }, defaultFabric: "#50B0FF",
      overlays: { "bo-tu-hac": { file: "vien-linh_nam_botu.webp", x: 177.9, y: 153.8, width: 143, height: 144 } } },
    nu: { file: "vien-linh_nu_shade.webp", fabricMask: "vien-linh_nu_fabric.webp", skinMask: "vien-linh_nu_skin.webp", width: 460, height: 705, face: { cx: 227.8, cy: -118.3, r: 180 }, neckY: 59.4, hands: { viewerLeft: { x: 107.7, y: 362.7 }, viewerRight: { x: 351.4, y: 363.2 } }, defaultFabric: "#CFD98D" },
  },
  "truc-linh": {
    nam: { file: "truc-linh_nam_shade.webp", fabricMask: "truc-linh_nam_fabric.webp", skinMask: "truc-linh_nam_skin.webp", width: 520, height: 711, face: { cx: 259.6, cy: -112.0, r: 180 }, neckY: 65.1, hands: { viewerLeft: { x: 113.8, y: 367.3 }, viewerRight: { x: 405.7, y: 367.4 } }, defaultFabric: "#30426A" },
    nu: { file: "truc-linh_nu_shade.webp", fabricMask: "truc-linh_nu_fabric.webp", skinMask: "truc-linh_nu_skin.webp", width: 469, height: 700, face: { cx: 231.3, cy: -124.1, r: 180 }, neckY: 53.9, hands: { viewerLeft: { x: 96.3, y: 323.5 }, viewerRight: { x: 369.9, y: 322.9 } }, defaultFabric: "#F5E4C5" },
  },
  "ngu-than-lap-co": {
    nam: { file: "ngu-than-lap-co_nam_shade.webp", fabricMask: "ngu-than-lap-co_nam_fabric.webp", skinMask: "ngu-than-lap-co_nam_skin.webp", width: 476, height: 722, face: { cx: 238.3, cy: -102.0, r: 180 }, neckY: 75.0, hands: { viewerLeft: { x: 42.8, y: 394.9 }, viewerRight: { x: 431.7, y: 395.2 } }, defaultFabric: "#354360" },
    nu: { file: "ngu-than-lap-co_nu_shade.webp", fabricMask: "ngu-than-lap-co_nu_fabric.webp", skinMask: "ngu-than-lap-co_nu_skin.webp", width: 420, height: 704, face: { cx: 210.1, cy: -120.2, r: 180 }, neckY: 58.6, hands: { viewerLeft: { x: 47.7, y: 381.5 }, viewerRight: { x: 370.3, y: 381.5 } }, defaultFabric: "#E1E8CC" },
  },
  "ao-tac": {
    nam: { file: "ao-tac_nam_shade.webp", fabricMask: "ao-tac_nam_fabric.webp", skinMask: "ao-tac_nam_skin.webp", width: 510, height: 718, face: { cx: 254.1, cy: -106.4, r: 180 }, neckY: 71.6, hands: { viewerLeft: { x: 68.2, y: 368.5 }, viewerRight: { x: 441.3, y: 368.5 } }, defaultFabric: "#48477D" },
    nu: { file: "ao-tac_nu_shade.webp", fabricMask: "ao-tac_nu_fabric.webp", skinMask: "ao-tac_nu_skin.webp", width: 348, height: 699, face: { cx: 171.4, cy: -123.9, r: 180 }, neckY: 54.0, hands: { viewerLeft: { x: 149.3, y: 283.5 }, viewerRight: { x: 198.2, y: 283.3 } }, defaultFabric: "#B3BA9B" },
  },
  "nhat-binh": {
    nu: { file: "nhat-binh_nu_shade.webp", fabricMask: "nhat-binh_nu_fabric.webp", skinMask: "nhat-binh_nu_skin.webp", width: 560, height: 705, face: { cx: 280.1, cy: -119.3, r: 180 }, neckY: 59.0, hands: { viewerLeft: { x: 29.8, y: 368.7 }, viewerRight: { x: 529.7, y: 368.0 } }, defaultFabric: "#FF211E" },
  },
  "tu-than-yem": {
    nu: { file: "tu-than-yem_nu_shade.webp", fabricMask: "tu-than-yem_nu_fabric.webp", skinMask: "tu-than-yem_nu_skin.webp", width: 440, height: 703, face: { cx: 217.4, cy: -121.2, r: 180 }, neckY: 56.9, hands: { viewerLeft: { x: 60.7, y: 355.9 }, viewerRight: { x: 378.5, y: 355.9 } }, defaultFabric: "#7D4336" },
  },
  "ba-ba-khan-ran": {
    nam: { file: "ba-ba-khan-ran_nam_shade.webp", fabricMask: "ba-ba-khan-ran_nam_fabric.webp", skinMask: "ba-ba-khan-ran_nam_skin.webp", width: 452, height: 717, face: { cx: 225.2, cy: -107.2, r: 180 }, neckY: 70.6, hands: { viewerLeft: { x: 50.9, y: 380.4 }, viewerRight: { x: 399.9, y: 380.4 } }, defaultFabric: "#3E3332" },
    nu: { file: "ba-ba-khan-ran_nu_shade.webp", fabricMask: "ba-ba-khan-ran_nu_fabric.webp", skinMask: "ba-ba-khan-ran_nu_skin.webp", width: 385, height: 697, face: { cx: 188.6, cy: -125.8, r: 180 }, neckY: 51.2, hands: { viewerLeft: { x: 32.9, y: 323.1 }, viewerRight: { x: 351.3, y: 322.8 } }, defaultFabric: "#D1D8A8" },
  },
};

export function spriteUrl(file: string): string {
  return SPRITE_BASE_URL + file;
}