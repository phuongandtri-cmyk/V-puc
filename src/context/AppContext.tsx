import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenId,
  CharacterConfig,
  OutfitConfig,
  CultureGuardEvaluation,
  PhotoboothConfig,
  Occasion,
} from '../types';
import { VIET_PHUC_GARMENTS, COLOR_PALETTES } from '../data/vietPhucData';
import { evaluateLook } from '../lib/cultureGuard';
import { normalizeMaleHairId } from '../components/character/MaleHair';
import {
  normalizeFemaleHairId,
  DEFAULT_FEMALE_HAIR,
} from '../components/character/FemaleHair';

interface AppContextType {
  currentScreen: ScreenId;
  navigateTo: (screen: ScreenId) => void;
  goBack: () => void;
  character: CharacterConfig;
  updateCharacter: (partial: Partial<CharacterConfig>) => void;
  outfit: OutfitConfig;
  updateOutfit: (partial: Partial<OutfitConfig>) => void;
  updateAccessory: (
    category: keyof OutfitConfig['accessories'],
    itemId: string
  ) => void;
  updateAccessoryGroup: (
    group: 'doiDau' | 'giay' | 'trangSuc' | 'hienDai' | 'diemNhan',
    itemId: string
  ) => void;
  selectedOccasion: Occasion | null;
  setSelectedOccasion: (occ: Occasion | null) => void;
  cultureEvaluation: CultureGuardEvaluation;
  photoboothConfig: PhotoboothConfig;
  updatePhotoboothConfig: (partial: Partial<PhotoboothConfig>) => void;
  isGeneratingPhotobooth: boolean;
  photoboothProgressText: string;
  photoboothPercent: number;
  triggerPhotobooth: () => Promise<void>;
  resetToDefault: () => void;
  casualSnapshot: CharacterConfig | null;
  saveCasualSnapshot: () => void;
}

const DEFAULT_CHARACTER: CharacterConfig = {
  name: '',
  gender: 'nu',
  height: 165, // 145 - 190 cm
  heightCm: 165,
  weight: 54,  // 40 - 95 kg
  weightKg: 54,
  skinTone: '#FFE7D1', // Trắng Sứ Điệp
  expression: 'vui',
  hairStyle: DEFAULT_FEMALE_HAIR,
  hairColor: '#1E1B18',
};

const SESSION_STORAGE_KEY = 'vietphuc_remix_character_profile';

const loadSavedCharacterProfile = (): CharacterConfig => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const height = Number(parsed.heightCm ?? parsed.height ?? DEFAULT_CHARACTER.height);
          const weight = Number(parsed.weightKg ?? parsed.weight ?? DEFAULT_CHARACTER.weight);
          const gender = parsed.gender === 'nam' ? 'nam' : 'nu';
          const hairStyle = gender === 'nam'
            ? normalizeMaleHairId(parsed.hairStyle)
            : normalizeFemaleHairId(parsed.hairStyle);

          return {
            ...DEFAULT_CHARACTER,
            gender,
            height,
            heightCm: height,
            weight,
            weightKg: weight,
            skinTone: typeof parsed.skinTone === 'string' ? parsed.skinTone : DEFAULT_CHARACTER.skinTone,
            hairStyle,
            hairColor: typeof parsed.hairColor === 'string' ? parsed.hairColor : DEFAULT_CHARACTER.hairColor,
            expression: parsed.expression || DEFAULT_CHARACTER.expression,
            name: typeof parsed.name === 'string' ? parsed.name : DEFAULT_CHARACTER.name,
          };
        }
      }
    }
  } catch (e) {
    console.error('Failed to restore character profile from sessionStorage', e);
  }
  return {
    ...DEFAULT_CHARACTER,
    heightCm: DEFAULT_CHARACTER.height,
    weightKg: DEFAULT_CHARACTER.weight,
  };
};

const DEFAULT_OUTFIT: OutfitConfig = {
  garmentId: 'giao-linh',
  colorId: 'mau-goc',
  primaryColor: '#C1262A', // Màu gốc của giao-linh nữ
  pantColor: '#FFFDF7',    // Trắng Điệp
  accessories: {
    doiDau: undefined,
    trangSuc: [],
    hienDai: [],
  },
};

const DEFAULT_PHOTOBOOTH: PhotoboothConfig = {
  bgTheme: 'dong-ho-do-son',
  framePattern: 'hoa-sen',
  caption: 'Hồn Cổ Phục Trong Nhịp Thở Phố',
  stickerStamp: 'Hài Hòa Di Sản',
  landmarkId: 'hoang-thanh-hue',
  landmarkScene: 'hoang-thanh-hue',
  frameColor: '#D9442B',
  useRealFace: true,
  applyPhotoSkin: true,
  paintFilterEnabled: true,
  faceCutout: null,
};

const PHOTOBOOTH_STORAGE_KEY = 'vietphuc_remix_photobooth_settings';

const loadSavedPhotoboothSettings = (): PhotoboothConfig => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(PHOTOBOOTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_PHOTOBOOTH,
            landmarkId: parsed.landmarkId || 'hoang-thanh-hue',
            landmarkScene: parsed.landmarkScene || parsed.landmarkId || 'hoang-thanh-hue',
            frameColor: parsed.frameColor || '#D9442B',
            bgTheme: parsed.bgTheme || 'dong-ho-do-son',
            caption: typeof parsed.caption === 'string' ? parsed.caption : DEFAULT_PHOTOBOOTH.caption,
          };
        }
      }
    }
  } catch (e) {
    console.error('Failed to load photobooth settings from sessionStorage', e);
  }
  return DEFAULT_PHOTOBOOTH;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(1);
  const [character, setCharacter] = useState<CharacterConfig>(loadSavedCharacterProfile);
  const [outfit, setOutfit] = useState<OutfitConfig>(DEFAULT_OUTFIT);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [photoboothConfig, setPhotoboothConfig] =
    useState<PhotoboothConfig>(loadSavedPhotoboothSettings);
  const [isGeneratingPhotobooth, setIsGeneratingPhotobooth] = useState(false);
  const [photoboothProgressText, setPhotoboothProgressText] = useState('');
  const [photoboothPercent, setPhotoboothPercent] = useState(0);
  const [casualSnapshot, setCasualSnapshot] = useState<CharacterConfig | null>(character);

  // Sync photobooth settings to sessionStorage (landmarkId, frameColor, caption only; never face image)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const toSave = {
          landmarkId: photoboothConfig.landmarkId,
          landmarkScene: photoboothConfig.landmarkScene,
          frameColor: photoboothConfig.frameColor,
          bgTheme: photoboothConfig.bgTheme,
          caption: photoboothConfig.caption,
        };
        sessionStorage.setItem(PHOTOBOOTH_STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch (e) {
      console.error('Failed to persist photobooth settings to sessionStorage', e);
    }
  }, [
    photoboothConfig.landmarkId,
    photoboothConfig.landmarkScene,
    photoboothConfig.frameColor,
    photoboothConfig.bgTheme,
    photoboothConfig.caption,
  ]);

  // Sync character to sessionStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const profile = {
          gender: character.gender,
          heightCm: character.heightCm ?? character.height,
          weightKg: character.weightKg ?? character.weight,
          skinTone: character.skinTone,
          hairStyle: character.hairStyle,
          hairColor: character.hairColor,
          expression: character.expression,
          name: character.name,
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (e) {
      console.error('Failed to persist character profile to sessionStorage', e);
    }
  }, [character]);

  // Live evaluation whenever selection or character changes
  const cultureEvaluation = evaluateLook({
    outfitId: outfit.garmentId,
    colorId: outfit.colorId,
    colorHex: outfit.primaryColor,
    accessories: outfit.accessories,
    gender: character.gender,
    occasion: selectedOccasion,
  });

  const saveCasualSnapshot = () => {
    setCasualSnapshot({ ...character });
  };

  const navigateTo = (screen: ScreenId) => {
    if (currentScreen === 1 && screen === 2) {
      setCasualSnapshot({ ...character });
    }
    setCurrentScreen(screen);
    // Smooth scroll to top when changing screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen((prev) => (prev - 1) as ScreenId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateCharacter = (partial: Partial<CharacterConfig>) => {
    setCharacter((prev) => {
      const next = { ...prev, ...partial };
      if (partial.height !== undefined && partial.heightCm === undefined) {
        next.heightCm = partial.height;
      } else if (partial.heightCm !== undefined && partial.height === undefined) {
        next.height = partial.heightCm;
      }
      if (partial.weight !== undefined && partial.weightKg === undefined) {
        next.weightKg = partial.weight;
      } else if (partial.weightKg !== undefined && partial.weight === undefined) {
        next.weight = partial.weightKg;
      }

      if (next.gender === 'nam' && next.hairStyle) {
        next.hairStyle = normalizeMaleHairId(next.hairStyle);
      } else if (next.gender === 'nu' && next.hairStyle) {
        next.hairStyle = normalizeFemaleHairId(next.hairStyle);
      }
      return next;
    });
  };

  const updateOutfit = (partial: Partial<OutfitConfig>) => {
    setOutfit((prev) => {
      const updated = { ...prev, ...partial };
      // When garment changes, match its default color
      if (partial.garmentId && partial.garmentId !== prev.garmentId) {
        const found = VIET_PHUC_GARMENTS.find((g) => g.id === partial.garmentId);
        if (found) {
          updated.primaryColor = partial.primaryColor ?? found.defaultColors.primary;
          updated.pantColor = found.defaultColors.pant;
        }
        if (!partial.colorId) {
          updated.colorId = 'mau-goc';
        }
      }
      return updated;
    });
  };

  const updateAccessory = (
    category: keyof OutfitConfig['accessories'],
    itemId: string
  ) => {
    setOutfit((prev) => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [category]: itemId,
      },
    }));
  };

  const updateAccessoryGroup = (
    group: 'doiDau' | 'giay' | 'trangSuc' | 'hienDai' | 'diemNhan',
    itemId: string
  ) => {
    setOutfit((prev) => {
      const acc = { ...prev.accessories };
      const VALID_IDS = new Set([
        'khan-xep',
        'khan-mo-qua',
        'non-quai-thao',
        'khan-ran',
        'kieng-co',
        'kinh-ram',
        'tui-tote',
      ]);
      if (group === 'doiDau') {
        // Single select, deselectable
        acc.doiDau = acc.doiDau === itemId ? undefined : (VALID_IDS.has(itemId) ? itemId : undefined);
      } else if (group === 'trangSuc') {
        const currentList = (acc.trangSuc || []).filter((id) => VALID_IDS.has(id));
        acc.trangSuc = currentList.includes(itemId)
          ? currentList.filter((id) => id !== itemId)
          : [...currentList, itemId];
      } else if (group === 'hienDai') {
        const currentList = (acc.hienDai || []).filter((id) => VALID_IDS.has(id));
        acc.hienDai = currentList.includes(itemId)
          ? currentList.filter((id) => id !== itemId)
          : [...currentList, itemId];
      } else if (group === 'diemNhan') {
        if (itemId === 'kieng-co') {
          const currentList = (acc.trangSuc || []).filter((id) => VALID_IDS.has(id));
          acc.trangSuc = currentList.includes(itemId)
            ? currentList.filter((id) => id !== itemId)
            : [...currentList, itemId];
        } else if (VALID_IDS.has(itemId)) {
          const currentList = (acc.hienDai || []).filter((id) => VALID_IDS.has(id));
          acc.hienDai = currentList.includes(itemId)
            ? currentList.filter((id) => id !== itemId)
            : [...currentList, itemId];
        }
      }
      delete (acc as any).giay;
      return { ...prev, accessories: acc };
    });
  };

  const updatePhotoboothConfig = (partial: Partial<PhotoboothConfig>) => {
    setPhotoboothConfig((prev) => ({ ...prev, ...partial }));
  };

  const triggerPhotobooth = async () => {
    setIsGeneratingPhotobooth(true);
    setPhotoboothPercent(10);
    setPhotoboothProgressText('Đang chuốt nét mộc khắc gỗ dân gian...');

    // Artificial 3-second delay with animated progress steps
    const steps = [
      { text: 'Đang chuốt nét mộc khắc gỗ dân gian...', percent: 20 },
      { text: 'Đang nghiền bột vỏ điệp óng ánh rải nền giấy dó...', percent: 45 },
      { text: 'Đang dập lớp màu tự nhiên: Vàng Hòe, Đỏ Son, Xanh Chàm...', percent: 75 },
      { text: 'Đang ép bản mực than lá tre, hoàn tất thẻ phong cách...', percent: 95 },
    ];

    for (const step of steps) {
      setPhotoboothProgressText(step.text);
      setPhotoboothPercent(step.percent);
      await new Promise((r) => setTimeout(r, 750));
    }

    setPhotoboothPercent(100);
    setPhotoboothProgressText('Hoàn thành khắc in Lookbook!');
    await new Promise((r) => setTimeout(r, 300));

    setIsGeneratingPhotobooth(false);
    navigateTo(4); // Navigate to Screen 4 (Lookbook Card)
  };

  const resetToDefault = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to clear character profile from sessionStorage', e);
    }
    const freshDefault: CharacterConfig = {
      ...DEFAULT_CHARACTER,
      heightCm: DEFAULT_CHARACTER.height,
      weightKg: DEFAULT_CHARACTER.weight,
    };
    setCharacter(freshDefault);
    setCasualSnapshot(freshDefault);
    setOutfit(DEFAULT_OUTFIT);
    setSelectedOccasion(null);
    setPhotoboothConfig(DEFAULT_PHOTOBOOTH);
    setCurrentScreen(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        goBack,
        character,
        updateCharacter,
        outfit,
        updateOutfit,
        updateAccessory,
        updateAccessoryGroup,
        selectedOccasion,
        setSelectedOccasion,
        cultureEvaluation,
        photoboothConfig,
        updatePhotoboothConfig,
        isGeneratingPhotobooth,
        photoboothProgressText,
        photoboothPercent,
        triggerPhotobooth,
        resetToDefault,
        casualSnapshot,
        saveCasualSnapshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
