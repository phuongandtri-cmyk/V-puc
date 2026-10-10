// cultureGuard.ts — Logic kiểm định Culture Guard thuần (pure function)
import { outfits, Outfit, Occasion } from '../data/outfits';
import { colors, patterns, accessories, Tag } from '../data/stylingOptions';
import { cultureRules, CultureRule } from '../data/cultureRules';

export interface LookSelection {
  outfitId: string;
  colorId?: string;
  colorHex?: string;
  patternId?: string;
  accessories:
    | string[]
    | {
        doiDau?: string;
        giay?: string;
        trangSuc?: string[];
        hienDai?: string[];
        headwear?: string;
        footwear?: string;
        jewelry?: string[] | string;
        modern?: string[];
        handheld?: string;
        eyewear?: string;
      };
  gender: 'nam' | 'nu';
  occasion?: Occasion | null;
}

export interface CultureGuardResult {
  level: 'xanh' | 'vang' | 'do';
  label: '✓ Hài hòa' | '! Cân nhắc' | '✕ Chưa phù hợp';
  badgeColor: string; // #3E7D4F | #E9B824 | #8E1B1B
  textColor: string;  // #FFFFFF | #1E1B18 | #FFFFFF
  matches: CultureRule[];
  message?: string;
}

const SEVERITY_WEIGHT: Record<'xanh' | 'vang' | 'do', number> = {
  do: 3,
  vang: 2,
  xanh: 1,
};

export function evaluateLook(selection: LookSelection): CultureGuardResult {
  const currentOutfit =
    outfits.find((o) => o.id === selection.outfitId) || outfits[0];
  const charGender: 'nam' | 'nu' = selection.gender === 'nam' ? 'nam' : 'nu';
  const currentOccasion = selection.occasion || null;

  // 1. Thu thập tags từ màu, họa tiết và phụ kiện
  const collectedTags: Tag[] = [];

  // Color tags
  const selectedColor = colors.find(
    (c) =>
      c.id === selection.colorId ||
      (selection.colorHex && c.hex.toLowerCase() === selection.colorHex.toLowerCase())
  );
  if (selectedColor && selectedColor.tags) {
    collectedTags.push(...selectedColor.tags);
  }

  // Pattern tags: removed from app, evaluateLook no longer receives pattern tags

  // Accessories tags
  let accessoryIds: string[] = [];
  if (Array.isArray(selection.accessories)) {
    accessoryIds = selection.accessories;
  } else if (selection.accessories && typeof selection.accessories === 'object') {
    Object.values(selection.accessories).forEach((val) => {
      if (Array.isArray(val)) {
        accessoryIds.push(...val);
      } else if (typeof val === 'string' && val) {
        accessoryIds.push(val);
      }
    });
  }

  accessoryIds.forEach((id) => {
    const acc = accessories.find((a) => a.id === id);
    if (acc && acc.tags) {
      collectedTags.push(...acc.tags);
    }
  });

  // 2. Kiểm tra từng luật trong cultureRules
  const matches: CultureRule[] = [];

  for (const rule of cultureRules) {
    const { khiNao } = rule;

    // outfitIds: chỉ áp dụng khi trang phục đang chọn nằm trong danh sách
    if (khiNao.outfitIds !== undefined && !khiNao.outfitIds.includes(currentOutfit.id)) {
      continue;
    }

    // outfitIdsNgoaiTru: không áp dụng cho các trang phục này
    if (khiNao.outfitIdsNgoaiTru !== undefined && khiNao.outfitIdsNgoaiTru.includes(currentOutfit.id)) {
      continue;
    }

    // gioiTinhNhanVat: equals character gender
    if (khiNao.gioiTinhNhanVat !== undefined && khiNao.gioiTinhNhanVat !== charGender) {
      continue;
    }

    // suKien: dịp đang chọn nằm trong danh sách
    if (khiNao.suKien !== undefined) {
      if (!currentOccasion || !khiNao.suKien.includes(currentOccasion)) {
        continue;
      }
    }

    // coTag: lựa chọn hiện tại có ít nhất 1 tag trong danh sách
    if (khiNao.coTag !== undefined) {
      const hasTag = khiNao.coTag.some((tag) => collectedTags.includes(tag));
      if (!hasTag) {
        continue;
      }
    }

    // trangPhucKhacGioi: outfit.gioiTinh khác "ca-hai" và khác giới tính nhân vật
    if (khiNao.trangPhucKhacGioi === true) {
      const isDifferent =
        currentOutfit.gioiTinh !== 'ca-hai' && currentOutfit.gioiTinh !== charGender;
      if (!isDifferent) {
        continue;
      }
    }

    // dipNgoaiBoiCanh: đã chọn dịp nhưng dịp đó không có trong outfit.suKienPhuHop
    if (khiNao.dipNgoaiBoiCanh === true) {
      if (!currentOccasion || currentOutfit.suKienPhuHop.includes(currentOccasion)) {
        continue;
      }
    }

    // Tất cả điều kiện có mặt trong khiNao đều thỏa mãn
    matches.push(rule);
  }

  // 3. Sắp xếp matches theo mức độ nghiêm trọng (đỏ trước, rồi vàng, rồi xanh)
  matches.sort((a, b) => SEVERITY_WEIGHT[b.mucDo] - SEVERITY_WEIGHT[a.mucDo]);

  // 4. Mức độ tổng quan: do > vang > xanh
  let level: 'xanh' | 'vang' | 'do' = 'xanh';
  if (matches.some((m) => m.mucDo === 'do')) {
    level = 'do';
  } else if (matches.some((m) => m.mucDo === 'vang')) {
    level = 'vang';
  } else {
    level = 'xanh';
  }

  const label: '✓ Hài hòa' | '! Cân nhắc' | '✕ Chưa phù hợp' =
    level === 'xanh' ? '✓ Hài hòa' : level === 'vang' ? '! Cân nhắc' : '✕ Chưa phù hợp';
  const badgeColor = level === 'xanh' ? '#3E7D4F' : level === 'vang' ? '#E9B824' : '#8E1B1B';
  const textColor = level === 'vang' ? '#1E1B18' : '#FFFFFF';

  return {
    level,
    label,
    badgeColor,
    textColor,
    matches,
    message: matches.length === 0 ? 'Chưa phát hiện điểm sai lệch văn hóa.' : undefined,
  };
}
