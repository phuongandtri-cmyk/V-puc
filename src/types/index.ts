import type { CultureRule } from '../../data/cultureRules';

export type ScreenId = 1 | 2 | 3 | 4;

export type Gender = 'nu' | 'nam';

export type Occasion = 'tet' | 'ky-yeu' | 'le-hoi' | 'cuoi-hoi' | 'dao-pho' | 'le-chua';

export type Expression = 'vui' | 'cool' | 'dang-yeu' | 'kieu-ky';

export type HairStyle =
  | 'bui-thap-truyen-thong'
  | 'van-toc-cai-tram'
  | 'bui-cao-cung-dinh'
  | 'toc-dai-co-dien'
  | 'Búi thấp truyền thống'
  | 'Vấn tóc cài trâm'
  | 'Búi cao cung đình'
  | 'Tóc dài cổ điển'
  | 'textured-quiff'
  | 'messy-fringe'
  | 'half-up-bun'
  | 'low-ponytail'
  | 'Textured Quiff'
  | 'Messy Fringe'
  | 'Tóc buộc nửa đầu'
  | 'Tóc đuôi ngựa'
  | 'khan-dong'
  | 'Khăn đóng nam';

export interface GarmentItem {
  id: string;
  name: string;
  dynasty: string; // e.g. 'Triều Nguyễn', 'Thời Lê', 'Thời Lý - Trần'
  period: string; // 'Thế kỷ 19-20', 'Thế kỷ 15-18', 'Thế kỷ 11-14'
  description: string;
  significance: string;
  culturalRank: 'ceremonial' | 'court' | 'daily' | 'festive';
  allowedPantColors: string[];
  defaultColors: {
    primary: string;
    collar: string;
    pant: string;
  };
}

export interface AccessoryItem {
  id: string;
  category: 'footwear' | 'headwear' | 'eyewear' | 'handheld' | 'jewelry';
  name: string;
  modernStyle: string; // e.g. 'Streetwear', 'Y2K Cyber', 'Indie Folk', 'Modern Minimalist'
  description: string;
  harmonyLevel: 'high' | 'medium' | 'sensitive';
  culturalNote: string;
}

export interface CharacterConfig {
  name: string;
  gender: Gender;
  height: number; // 145 - 190
  heightCm?: number;
  weight: number; // 40 - 95
  weightKg?: number;
  skinTone: string;
  expression: Expression;
  hairStyle: HairStyle;
  hairColor: string;
  rotationAngle?: number;
}

export interface OutfitAccessoriesConfig {
  doiDau?: string;
  giay?: string;
  trangSuc?: string[];
  hienDai?: string[];
  footwear?: string;
  headwear?: string;
  eyewear?: string;
  handheld?: string;
  jewelry?: string;
  [key: string]: any;
}

export interface OutfitConfig {
  garmentId: string;
  colorId?: string;
  primaryColor: string;
  pantColor: string;
  pattern?: string;
  accessories: OutfitAccessoriesConfig;
}

export interface CultureGuardEvaluation {
  level: 'xanh' | 'vang' | 'do';
  label: '✓ Hài hòa' | '! Cân nhắc' | '✕ Chưa phù hợp';
  badgeColor: string; // CSS color
  textColor: string;  // CSS text color
  matches: CultureRule[];
  message?: string;
}

export interface FaceCutoutData {
  facePatchUrl: string;
  dataUrl?: string;
  eyeLeft?: { x: number; y: number };
  eyeRight?: { x: number; y: number };
  eyeMid?: { x: number; y: number };
  chinY?: number;
  eyeLineWidth?: number;
  cutoutWidth?: number;
  skinHex: string;
  photoFaceBoxWidth?: number;
  photoFaceBoxHeight?: number;
  photoEyeNormY?: number;
  note?: string;
}

export interface PhotoboothConfig {
  bgTheme: 'dong-ho-do-son' | 'dong-ho-vang-hoe' | 'dong-ho-xanh-cham' | 'hoang-thanh-pop';
  framePattern: 'hoa-sen' | 'chim-lac' | 'may-song' | 'song-nuoc';
  caption: string;
  stickerStamp: string;
  landmarkScene?: string;
  landmarkId?: string;
  frameColor?: string;
  userFaceImage?: string | null;
  faceCutout?: FaceCutoutData | null;
  useRealFace?: boolean;
  applyPhotoSkin?: boolean;
  paintFilterEnabled?: boolean;
}
