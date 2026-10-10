import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChibiFigure } from '../character/ChibiFigure';
import {
  outfits,
  SHOW_ONLY_APPROVED,
  Outfit,
  Occasion,
  Gender,
} from '../../data/outfits';
import {
  colors,
  accessories,
  ColorOption,
  AccessoryOption,
} from '../../data/stylingOptions';
import { CultureRule } from '../../data/cultureRules';
import { MergedOutfitCard } from '../character/MergedOutfitCard';
import { outfitSprites } from '../../../data/outfitSprites';
import { resolveGarmentColor } from '../character/ChibiFigure';
import {
  ArrowRight,
  Palette,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  X,
  Shirt,
  ExternalLink,
} from 'lucide-react';

const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: 'tet', label: 'Tết' },
  { id: 'ky-yeu', label: 'Kỷ yếu – Tốt nghiệp' },
  { id: 'le-hoi', label: 'Lễ hội' },
  { id: 'cuoi-hoi', label: 'Cưới hỏi' },
  { id: 'dao-pho', label: 'Dạo phố – Chụp ảnh' },
  { id: 'le-chua', label: 'Lễ chùa – Đình' },
];

export const BasisLine: React.FC<{ rule: CultureRule; selectedOutfitId: string }> = ({
  rule,
}) => {
  if (rule.loaiCanCu === 'nguyen-tac-remix') {
    return (
      <div className="text-xs text-[#5A5148] flex items-center gap-1 mt-1 font-medium">
        <span>Căn cứ:</span>
        <span className="text-[#1E1B18]">Nguyên tắc phối của Việt phục Remix</span>
      </div>
    );
  }

  if (rule.loaiCanCu === 'tai-lieu') {
    if (!rule.canCu) {
      return (
        <div className="text-xs text-[#5A5148] flex items-center gap-1 mt-1 font-medium">
          <span>Căn cứ:</span>
          <span className="text-[#1E1B18]">dữ liệu trang phục đang chọn</span>
        </div>
      );
    }

    const referencedOutfit = outfits.find((o) => o.id === rule.canCu);
    const outfitName = referencedOutfit ? referencedOutfit.ten : rule.canCu;

    return (
      <div className="text-xs text-[#5A5148] flex flex-wrap items-center gap-1.5 mt-1 font-medium">
        <span>Căn cứ:</span>
        <span className="font-bold text-[#1E1B18]">{outfitName}</span>
        {referencedOutfit && referencedOutfit.nguon && referencedOutfit.nguon.length > 0 && (
          <span className="inline-flex flex-wrap items-center gap-1">
            (
            {referencedOutfit.nguon.map((src, i) => (
              <span key={i} className="inline-flex items-center">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2F4A7A] underline hover:text-[#1E1B18] inline-flex items-center gap-0.5"
                >
                  <span>{src.ten}</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
                {i < referencedOutfit.nguon.length - 1 && <span className="mr-1">,</span>}
              </span>
            ))}
            )
          </span>
        )}
      </div>
    );
  }

  return null;
};

export const Screen2Studio: React.FC = () => {
  const {
    character,
    outfit,
    updateOutfit,
    updateAccessoryGroup,
    selectedOccasion,
    setSelectedOccasion,
    cultureEvaluation,
    navigateTo,
  } = useApp();

  // Control panel active tab: 'garment' | 'style'
  const [activeTab, setActiveTab] = useState<'garment' | 'style'>('garment');

  // Merged card active sub-tab: 'storyteller' | 'sources' | 'reconstructed'
  const [activeSubTab, setActiveSubTab] = useState<'storyteller' | 'sources' | 'reconstructed'>('storyteller');

  // Culture Guard Popover
  const [showGuardPanel, setShowGuardPanel] = useState<boolean>(false);

  // References for scrolling
  const outfitScrollRef = useRef<HTMLDivElement>(null);
  const mergedCardRef = useRef<HTMLDivElement>(null);

  // Filter outfits by character gender:
  // If character is male ('nam'), hide outfits whose gioiTinh is 'nu'. Female ('nu') sees all outfits.
  const hiddenFemaleOutfits = character.gender === 'nam'
    ? outfits.filter((item) => item.gioiTinh === 'nu')
    : [];

  const availableOutfits = outfits.filter((item) => {
    if (SHOW_ONLY_APPROVED && item.trangThai === 'cho-duyet') return false;
    if (character.gender === 'nam' && item.gioiTinh === 'nu') return false;
    return true;
  });

  // If the selected outfit becomes hidden after gender change, clear selection
  useEffect(() => {
    if (outfit.garmentId) {
      const isStillAvailable = availableOutfits.some((o) => o.id === outfit.garmentId);
      if (!isStillAvailable) {
        updateOutfit({ garmentId: '' });
      }
    }
  }, [character.gender, outfit.garmentId, availableOutfits]);

  // Sort order:
  // 1. Outfits with "Hợp dịp" badge first
  // 2. Then demo === true
  // 3. Then the rest
  const hopDipGroup: Outfit[] = [];
  const demoGroup: Outfit[] = [];
  const restGroup: Outfit[] = [];

  for (const item of availableOutfits) {
    const isHopDip = Boolean(
      selectedOccasion && item.suKienPhuHop.includes(selectedOccasion)
    );
    if (isHopDip) {
      hopDipGroup.push(item);
    } else if (item.demo) {
      demoGroup.push(item);
    } else {
      restGroup.push(item);
    }
  }

  const sortedOutfits = [...hopDipGroup, ...demoGroup, ...restGroup];

  // Currently selected outfit (null if cleared)
  const selectedOutfit: Outfit | null =
    availableOutfits.find((o) => o.id === outfit.garmentId) || null;

  const formatGender = (gender: Gender): string => {
    if (gender === 'nam') return 'Nam';
    if (gender === 'nu') return 'Nữ';
    return 'Nam & Nữ';
  };

  const handleOccasionClick = (occId: Occasion) => {
    if (selectedOccasion === occId) {
      setSelectedOccasion(null); // Deselect on re-click
    } else {
      setSelectedOccasion(occId);
    }
  };

  // Auto-select "Màu gốc" whenever selected outfit changes, or update its default color if gender changes
  const prevGarmentIdRef = useRef<string>(outfit.garmentId);
  const prevGenderRef = useRef<string>(character.gender);
  useEffect(() => {
    const outfitChanged = outfit.garmentId && outfit.garmentId !== prevGarmentIdRef.current;
    const genderChanged = character.gender && character.gender !== prevGenderRef.current;

    if (outfitChanged || (genderChanged && outfit.colorId === 'mau-goc')) {
      prevGarmentIdRef.current = outfit.garmentId;
      prevGenderRef.current = character.gender;
      const charGender: 'nam' | 'nu' = character.gender === 'nu' ? 'nu' : 'nam';
      const sprite = outfitSprites[outfit.garmentId]?.[charGender];
      if (sprite) {
        updateOutfit({ colorId: 'mau-goc', primaryColor: sprite.defaultFabric });
      } else {
        const svgDef = resolveGarmentColor(outfit.garmentId);
        updateOutfit({ colorId: 'mau-goc', primaryColor: svgDef.fill });
      }
    }
  }, [outfit.garmentId, character.gender, outfit.colorId, updateOutfit]);

  // When user selects an outfit: switch to sub-tab "✦ Người kể chuyện", smooth-scroll if needed
  const handleSelectOutfit = (newOutfitId: string) => {
    const charGender: 'nam' | 'nu' = character.gender === 'nu' ? 'nu' : 'nam';
    const sprite = outfitSprites[newOutfitId]?.[charGender];
    const initialColor = sprite ? sprite.defaultFabric : resolveGarmentColor(newOutfitId).fill;

    updateOutfit({
      garmentId: newOutfitId,
      colorId: 'mau-goc',
      primaryColor: initialColor,
    });
    setActiveSubTab('storyteller');

    setTimeout(() => {
      if (mergedCardRef.current) {
        const rect = mergedCardRef.current.getBoundingClientRect();
        const isHeaderVisible = rect.top >= 0 && rect.top <= window.innerHeight - 120;
        if (!isHeaderVisible) {
          mergedCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 60);
  };

  const scrollOutfitRow = (direction: 'left' | 'right') => {
    if (outfitScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      outfitScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Clean up any obsolete accessory selections on mount or change
  useEffect(() => {
    const VALID_IDS = new Set(accessories.map((a) => a.id));
    const curAcc = outfit.accessories;
    let changed = false;
    let newDoiDau = curAcc.doiDau;
    if (newDoiDau && !VALID_IDS.has(newDoiDau)) {
      newDoiDau = undefined;
      changed = true;
    }
    const newTrangSuc = (curAcc.trangSuc || []).filter((id) => VALID_IDS.has(id));
    if (newTrangSuc.length !== (curAcc.trangSuc || []).length) {
      changed = true;
    }
    const newHienDai = (curAcc.hienDai || []).filter((id) => VALID_IDS.has(id));
    if (newHienDai.length !== (curAcc.hienDai || []).length) {
      changed = true;
    }
    if ((curAcc as any).giay !== undefined) {
      changed = true;
    }
    if (changed) {
      updateOutfit({
        accessories: {
          doiDau: newDoiDau,
          trangSuc: newTrangSuc,
          hienDai: newHienDai,
        },
      });
    }
  }, [outfit.accessories, updateOutfit]);

  // Accessory groups: Đội đầu (chọn 1) and Điểm nhấn (chọn nhiều)
  const headwearItems = accessories.filter((a) => a.nhom === 'doi-dau');
  const accentItems = accessories.filter((a) => a.nhom !== 'doi-dau');

  const selectedDoiDau = outfit.accessories.doiDau;
  const selectedTrangSuc = outfit.accessories.trangSuc || [];
  const selectedHienDai = outfit.accessories.hienDai || [];

  const IMPLEMENTED_OUTFITS = [
    'giao-linh',
    'vien-linh',
    'ngu-than-lap-co',
    'tu-than-yem',
    'ba-ba-khan-ran',
    'truc-linh',
    'ao-tac',
    'nhat-binh',
  ];
  const isSewing = selectedOutfit ? !IMPLEMENTED_OUTFITS.includes(selectedOutfit.id) : false;
  const activeGarmentId = isSewing || !selectedOutfit ? 'casual' : selectedOutfit.id;
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  // Summary chips resolution
  const selectedColorName =
    outfit.colorId === 'mau-goc'
      ? 'Màu gốc'
      : colors.find((c) => c.id === outfit.colorId || c.hex === outfit.primaryColor)?.ten || 'Đỏ son';

  const selectedAccItems: AccessoryOption[] = [];
  if (selectedDoiDau) {
    const acc = accessories.find((a) => a.id === selectedDoiDau);
    if (acc) selectedAccItems.push(acc);
  }
  for (const id of selectedTrangSuc) {
    const acc = accessories.find((a) => a.id === id);
    if (acc && !selectedAccItems.some((x) => x.id === acc.id)) {
      selectedAccItems.push(acc);
    }
  }
  for (const id of selectedHienDai) {
    const acc = accessories.find((a) => a.id === id);
    if (acc && !selectedAccItems.some((x) => x.id === acc.id)) {
      selectedAccItems.push(acc);
    }
  }

  return (
    <div className="w-full pb-24 md:pb-8">
      {/* Culture Guard Popover Dialog */}
      {showGuardPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B18]/50 backdrop-blur-xs">
          <div className="card-dongho-strong p-4 md:p-6 bg-[#FFFDF7] border-3 border-[#1E1B18] shadow-[6px_6px_0_#1E1B18] rounded-xl max-w-lg w-full relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1B18]">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 text-xs font-bold border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]"
                  style={{
                    backgroundColor: cultureEvaluation.badgeColor,
                    color: cultureEvaluation.textColor,
                  }}
                >
                  {cultureEvaluation.label}
                </span>
                <h2 className="font-display font-bold text-base md:text-lg text-[#1E1B18]">
                  Bảng phân tích Culture Guard
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuardPanel(false)}
                className="w-7 h-7 flex items-center justify-center border-2 border-[#1E1B18] bg-[#F4EBD9] hover:bg-[#E9B824] text-[#1E1B18] cursor-pointer rounded"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {cultureEvaluation.matches.length === 0 ? (
                <div className="p-4 border-2 border-[#1E1B18] bg-[#F0F7F2] text-xs md:text-sm text-[#1E1B18] flex items-center gap-2 rounded">
                  <ShieldCheck className="w-5 h-5 text-[#3E7D4F] shrink-0" />
                  <span className="font-medium">Chưa phát hiện điểm sai lệch văn hóa. Bộ phối hài hòa!</span>
                </div>
              ) : (
                cultureEvaluation.matches.map((rule) => {
                  const ruleBg =
                    rule.mucDo === 'do'
                      ? 'bg-[#FFF0F0] border-[#8E1B18]'
                      : rule.mucDo === 'vang'
                      ? 'bg-[#FFFDF0] border-[#E9B824]'
                      : 'bg-[#F0F7F2] border-[#3E7D4F]';
                  const tagColor =
                    rule.mucDo === 'do'
                      ? 'bg-[#8E1B1B] text-white'
                      : rule.mucDo === 'vang'
                      ? 'bg-[#E9B824] text-[#1E1B18]'
                      : 'bg-[#3E7D4F] text-white';

                  return (
                    <div
                      key={rule.id}
                      className={`p-3.5 border-2 text-xs space-y-1.5 rounded ${ruleBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-xs font-bold border border-[#1E1B18] ${tagColor}`}>
                          {rule.mucDo === 'do'
                            ? '✕ Chưa phù hợp'
                            : rule.mucDo === 'vang'
                            ? '! Cân nhắc'
                            : '✓ Hài hòa'}
                        </span>
                        <span className="font-bold text-[#1E1B18]">{rule.id}</span>
                      </div>
                      <p className="text-[#1E1B18] leading-relaxed">{rule.giaiThich}</p>
                      {selectedOutfit && <BasisLine rule={rule} selectedOutfitId={selectedOutfit.id} />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E1B18]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuardPanel(false)}
                className="btn-dongho px-4 py-1.5 bg-[#B8321C] text-white text-xs font-bold rounded cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN GRID (≥ 768px): grid-template-columns: 1fr minmax(340px, 40%); gap 24px */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(340px,40%)] gap-6 max-w-[1280px] mx-auto w-full items-start">
        {/* STAGE CARD: Desktop Right (Column 2), Mobile Top (order-1)
            Desktop (≥768px): position: sticky; top: 72px; height: calc(100vh - 88px);
            Mobile (<768px): Not sticky, normal flow
        */}
        <div className="w-full order-1 md:order-2 md:sticky md:top-[72px] md:h-[calc(100vh-88px)]">
          <div className="card-dongho-strong bg-[#FFFDF7] p-4 border-3 border-[#1E1B18] shadow-[5px_5px_0_#1E1B18] rounded-xl flex flex-col justify-between h-full overflow-hidden">
            {/* a) Top Row: label "Bộ phối của bạn" (left) + Culture Guard chip (right) */}
            <div className="w-full flex items-center justify-between pb-2 border-b-2 border-[#1E1B18] shrink-0">
              <span className="font-display font-bold text-xs md:text-sm text-[#2F4A7A] uppercase tracking-wider">
                Bộ phối của bạn
              </span>
              <button
                type="button"
                onClick={() => setShowGuardPanel(true)}
                className="btn-dongho px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
                style={{
                  backgroundColor: cultureEvaluation.badgeColor,
                  color: cultureEvaluation.textColor,
                }}
                title="Nhấn để xem chi tiết Culture Guard"
              >
                {cultureEvaluation.level === 'xanh' ? (
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : cultureEvaluation.level === 'vang' ? (
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{cultureEvaluation.label}</span>
              </button>
            </div>

            {/* b) Character preview, flex: 1, centered, never covered by anything */}
            <div className="w-full flex-1 flex items-center justify-center bg-[#F4EBD9] border-2 border-[#1E1B18] my-3 relative overflow-hidden rounded-lg min-h-[300px] md:min-h-0 p-3">
              {/* Small sticker in the stage corner: "Đang may: {selected outfit name}" only for un-implemented outfits */}
              {isSewing && selectedOutfit && (
                <div className="absolute top-2.5 left-2.5 z-20">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-[#E9B824] text-[#1E1B18] border-2 border-[#1E1B18] px-2 py-0.5 shadow-[2px_2px_0_#1E1B18] rounded">
                    Đang may: {selectedOutfit.ten}
                  </span>
                </div>
              )}

              <ChibiFigure
                character={character}
                outfit={activeGarmentId}
                colorHex={outfit.primaryColor}
                colorId={outfit.colorId}
                accessories={outfit.accessories}
                size={275}
                className="max-h-full max-w-full"
              />
            </div>

            {/* c) One row of summary chips (outfit · color · selected items), wrap, pill style */}
            <div className="w-full pt-1 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="border-2 border-[#1E1B18] rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#FFFDF7] text-[#1E1B18] shadow-[1px_1px_0_#1E1B18] truncate max-w-[160px]">
                  {selectedOutfit ? selectedOutfit.ten : 'Chưa chọn'}
                </span>
                <span className="border-2 border-[#1E1B18] rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#FFFDF7] text-[#B8321C] shadow-[1px_1px_0_#1E1B18]">
                  {selectedColorName}
                </span>
                {selectedAccItems.map((item) => (
                  <span
                    key={item.id}
                    className="border-2 border-[#1E1B18] rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#FFFDF7] text-[#1E1B18] shadow-[1px_1px_0_#1E1B18] truncate max-w-[140px]"
                  >
                    {item.ten}
                  </span>
                ))}
              </div>
            </div>

            {/* d) Reserved empty slot with id "hoa-than-slot" (min-height 0; used later for "Hóa thân" button) */}
            <div id="hoa-than-slot" className="w-full min-h-0 shrink-0" />

            {/* e) Primary button full width "Tiếp: Giám định →" (visible on desktop) */}
            <div className="hidden md:block w-full pt-3 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo(3)}
                className="w-full btn-dongho py-2.5 bg-[#B8321C] text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0_#1E1B18] rounded-lg hover:bg-[#9c2714]"
              >
                <span>Tiếp: Giám định →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Debug Gallery (only with ?debug=1) */}
          {isDebug && (
            <div className="mt-4 space-y-3">
              {/* Section: Kiểm tra cổ */}
              <div className="card-dongho p-3.5 bg-[#FFFDF7] border-2 border-[#1E1B18] shadow-[3px_3px_0_#1E1B18] rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#1E1B18]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#B8321C] uppercase tracking-wider font-mono">
                      🔍 Kiểm tra cổ (?debug=1)
                    </span>
                    <span className="text-[10px] bg-[#E8D9B5] px-1.5 py-0.5 rounded border border-[#1E1B18] font-bold">
                      {character?.gender === 'nu' ? '8 bộ Nữ' : '6 bộ Nam'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A5148]">
                    Đường magenta 1px: cằm SVG (appFaceCy + appFaceR = 262)
                  </span>
                </div>
                <div className="flex overflow-x-auto gap-2 pb-2 items-end">
                  {Object.keys(outfitSprites)
                    .filter(
                      (gId) =>
                        outfitSprites[gId]?.[
                          (character?.gender ?? 'nam') === 'nu' ? 'nu' : 'nam'
                        ] !== undefined
                    )
                    .map((garmentId) => {
                      const garmentInfo = outfits.find((o) => o.id === garmentId);
                      const gName = garmentInfo?.ten || garmentId;
                      return (
                        <div
                          key={garmentId}
                          className="flex flex-col items-center bg-[#F4EBD9] border border-[#1E1B18] p-1.5 rounded shrink-0 w-[110px]"
                        >
                          <span className="text-[10px] font-bold text-[#1E1B18] truncate w-full text-center">
                            {gName}
                          </span>
                          <div className="w-full h-[140px] flex items-center justify-center relative overflow-hidden bg-[#FFFDF7]/60 rounded mt-1 border border-[#1E1B18]/30">
                            <ChibiFigure
                              character={character}
                              outfit={garmentId}
                              colorHex={outfit.primaryColor}
                              colorId={outfit.colorId}
                              accessories={outfit.accessories}
                              height={140}
                              showChinLine={true}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Slider Extremes Gallery */}
              <div className="card-dongho p-3.5 bg-[#FFFDF7] border-2 border-[#1E1B18] shadow-[3px_3px_0_#1E1B18] rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#1E1B18]">
                  <span className="text-xs font-bold text-[#B8321C] uppercase tracking-wider font-mono">
                    🔧 DEBUG GALLERY (?debug=1)
                  </span>
                  <span className="text-[10px] font-mono text-[#5A5148]">
                    10 mẫu kiểm tra khớp (145cm/40kg &amp; 190cm/95kg)
                  </span>
                </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {IMPLEMENTED_OUTFITS.map((garmentId) => {
                  const garmentInfo = outfits.find((o) => o.id === garmentId);
                  const gName = garmentInfo?.ten || garmentId;
                  return (
                    <React.Fragment key={garmentId}>
                      {/* 145cm / 40kg */}
                      <div className="flex flex-col items-center bg-[#F4EBD9] border border-[#1E1B18] p-1.5 rounded">
                        <span className="text-[9px] font-bold text-[#1E1B18] truncate w-full text-center">
                          {gName}
                        </span>
                        <span className="text-[8px] font-mono text-[#5A5148] bg-[#FFFDF7] px-1 border border-[#1E1B18] my-0.5">
                          145cm/40kg
                        </span>
                        <div className="w-full h-32 flex items-center justify-center overflow-hidden">
                          <ChibiFigure
                            character={{
                              ...character,
                              height: 145,
                              heightCm: 145,
                              weight: 40,
                              weightKg: 40,
                            }}
                            outfit={garmentId}
                            colorHex={outfit.primaryColor}
                            colorId={outfit.colorId}
                            size={85}
                          />
                        </div>
                      </div>

                      {/* 190cm / 95kg */}
                      <div className="flex flex-col items-center bg-[#F4EBD9] border border-[#1E1B18] p-1.5 rounded">
                        <span className="text-[9px] font-bold text-[#1E1B18] truncate w-full text-center">
                          {gName}
                        </span>
                        <span className="text-[8px] font-mono text-[#5A5148] bg-[#FFFDF7] px-1 border border-[#1E1B18] my-0.5">
                          190cm/95kg
                        </span>
                        <div className="w-full h-32 flex items-center justify-center overflow-hidden">
                          <ChibiFigure
                            character={{
                              ...character,
                              height: 190,
                              heightCm: 190,
                              weight: 95,
                              weightKg: 95,
                            }}
                            outfit={garmentId}
                            colorHex={outfit.primaryColor}
                            colorId={outfit.colorId}
                            size={85}
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            </div>
          )}
        </div>

        {/* CONTROL PANEL: Desktop Left (Column 1), Mobile Bottom (order-2) */}
        <div className="order-2 md:order-1 flex flex-col gap-4 min-w-0 w-full">
          {/* a) "Dịp" row: label "Dịp:" + the 6 occasion chips on ONE wrapping row */}
          <div className="card-dongho p-3 md:p-3.5 bg-[#FFFDF7] rounded-xl flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#D9442B]" />
              <span>Dịp:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {OCCASIONS.map((occ) => {
                const isSelected = selectedOccasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => handleOccasionClick(occ.id)}
                    className={`px-3 py-1 text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 rounded-sm ${
                      isSelected
                        ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]'
                        : 'bg-[#F4EBD9] text-[#1E1B18] border-[#1E1B18]/40 hover:border-[#1E1B18] hover:bg-[#ebdcc4]'
                    }`}
                  >
                    <span>{occ.label}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}

              {selectedOccasion && (
                <button
                  type="button"
                  onClick={() => setSelectedOccasion(null)}
                  className="text-xs text-[#B8321C] hover:underline cursor-pointer font-bold px-1"
                >
                  Bỏ chọn
                </button>
              )}
            </div>
          </div>

          {/* b) Tabs (segmented, full width): "Trang phục" | "Màu & phụ kiện" */}
          <div className="flex border-2 border-[#1E1B18] bg-[#F4EBD9] p-1 gap-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('garment')}
              className={`flex-1 py-2 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded ${
                activeTab === 'garment'
                  ? 'bg-[#B8321C] text-white shadow-[2px_2px_0_#1E1B18]'
                  : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Trang phục</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-2 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded ${
                activeTab === 'style'
                  ? 'bg-[#B8321C] text-white shadow-[2px_2px_0_#1E1B18]'
                  : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Màu & phụ kiện</span>
            </button>
          </div>

          {/* c) TAB 1: TRANG PHỤC */}
          {activeTab === 'garment' && (
            <div className="space-y-4">
              {/* Horizontal Scroll Outfit Selector */}
              <div className="card-dongho p-3 bg-[#FFFDF7] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E1B18]">
                    Chọn cổ phục truyền thống:
                  </span>
                  {/* Left / Right scroll arrow buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollOutfitRow('left')}
                      aria-label="Cuộn sang trái"
                      className="w-7 h-7 rounded border-2 border-[#1E1B18] bg-[#F4EBD9] hover:bg-[#ebdcc4] flex items-center justify-center text-[#1E1B18] cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollOutfitRow('right')}
                      aria-label="Cuộn sang phải"
                      className="w-7 h-7 rounded border-2 border-[#1E1B18] bg-[#F4EBD9] hover:bg-[#ebdcc4] flex items-center justify-center text-[#1E1B18] cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Horizontal scroll row (cards 168px wide, scroll-snap) */}
                <div
                  ref={outfitScrollRef}
                  className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {sortedOutfits.map((item) => {
                    const isSelected = outfit.garmentId === item.id;
                    const isMatchOccasion =
                      selectedOccasion && item.suKienPhuHop.includes(selectedOccasion);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectOutfit(item.id)}
                        className={`w-[168px] min-w-[168px] shrink-0 snap-start p-3 text-left transition-all cursor-pointer rounded-lg flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FBEAE6] border-[3px] border-[#1E1B18] shadow-[3px_3px_0_#1E1B18]'
                            : 'bg-[#F4EBD9] border-2 border-[#1E1B18]/50 hover:bg-[#ebdcc4]'
                        }`}
                      >
                        <div>
                          {/* Name (bold) */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-display font-bold text-xs md:text-sm text-[#1E1B18] leading-tight line-clamp-2">
                              {item.ten}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 bg-[#D9442B] text-white flex items-center justify-center shrink-0 rounded-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Gender label */}
                          <div className="text-xs text-[#2F4A7A] font-semibold mt-1">
                            {formatGender(item.gioiTinh)}
                          </div>
                        </div>

                        {/* Badges: "Hợp dịp" + small verification badge */}
                        <div className="flex flex-wrap items-center gap-1 mt-2.5 pt-1.5 border-t border-[#1E1B18]/20">
                          {isMatchOccasion && (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-[#E9B824] text-[#1E1B18] border border-[#1E1B18] rounded-xs">
                              Hợp dịp
                            </span>
                          )}
                          {item.trangThai === 'da-duyet' ? (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-[#D4EDDA] text-[#3E7D4F] border border-[#3E7D4F] rounded-xs">
                              ✓ Đã kiểm chứng
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-[#E5DFD3] text-[#5A5148] border border-[#5A5148]/40 rounded-xs">
                              Đang kiểm chứng
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Notice when outfits are hidden by character gender */}
                {hiddenFemaleOutfits.length > 0 && (
                  <p className="text-[11px] text-[#5A5148] italic pt-1 border-t border-[#1E1B18]/10">
                    Đã ẩn {hiddenFemaleOutfits.length} bộ dành riêng cho nữ: {hiddenFemaleOutfits.map((o) => o.ten).join(', ')}
                  </p>
                )}
              </div>

              {/* Below: Merged Card "HỒ SƠ TRANG PHỤC" */}
              <MergedOutfitCard
                selectedOutfit={selectedOutfit}
                character={character}
                outfit={outfit}
                cultureEvaluation={cultureEvaluation}
                selectedOccasion={selectedOccasion}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                cardRef={mergedCardRef}
              />
            </div>
          )}

          {/* d) TAB 2: MÀU & PHỤ KIỆN */}
          {activeTab === 'style' && (
            <div className="card-dongho p-4 md:p-5 bg-[#FFFDF7] space-y-6 rounded-xl">
              {/* a) MÀU SẮC TRANG PHỤC */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#D9442B]" />
                    <span>Màu sắc trang phục:</span>
                  </label>
                  <span className="text-xs text-[#5A5148] italic">Bảng màu tự nhiên</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* FIRST SWATCH: "Màu gốc" */}
                  {(() => {
                    const charGender: 'nam' | 'nu' = character.gender === 'nu' ? 'nu' : 'nam';
                    const activeSprite = outfitSprites[outfit.garmentId]?.[charGender];
                    const defaultHex = activeSprite
                      ? activeSprite.defaultFabric
                      : resolveGarmentColor(outfit.garmentId).fill;
                    const isSelected = outfit.colorId === 'mau-goc';

                    return (
                      <button
                        key="mau-goc"
                        type="button"
                        onClick={() =>
                          updateOutfit({
                            colorId: 'mau-goc',
                            primaryColor: defaultHex,
                          })
                        }
                        className={`p-2.5 border-2 text-left transition-all cursor-pointer relative rounded-md ${
                          isSelected
                            ? 'border-[#1E1B18] bg-[#FBEAE6] shadow-[2px_2px_0_#1E1B18]'
                            : 'border-[#1E1B18]/40 bg-[#F4EBD9] hover:border-[#1E1B18] hover:bg-[#ebdcc4]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-[#1E1B18] shrink-0 shadow-xs"
                            style={{ backgroundColor: defaultHex }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-[#1E1B18] truncate block">
                              Màu gốc
                            </span>
                            <span className="text-xs text-[#5A5148] font-mono truncate block">
                              {defaultHex}
                            </span>
                          </div>
                        </div>
                        <span className="mt-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 bg-[#FFFDF7] text-[#1E1B18] border border-[#1E1B18]/40 rounded-xs">
                          Mặc định
                        </span>
                      </button>
                    );
                  })()}

                  {colors.map((color: ColorOption) => {
                    const isSelected = outfit.colorId === color.id;
                    const isTraditional = selectedOutfit
                      ? color.truyenThongCho.includes(selectedOutfit.id)
                      : false;

                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() =>
                          updateOutfit({
                            colorId: color.id,
                            primaryColor: color.hex,
                          })
                        }
                        className={`p-2.5 border-2 text-left transition-all cursor-pointer relative rounded-md ${
                          isSelected
                            ? 'border-[#1E1B18] bg-[#FBEAE6] shadow-[2px_2px_0_#1E1B18]'
                            : 'border-[#1E1B18]/40 bg-[#F4EBD9] hover:border-[#1E1B18] hover:bg-[#ebdcc4]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-[#1E1B18] shrink-0 shadow-xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-[#1E1B18] truncate block">
                              {color.ten}
                            </span>
                            <span className="text-xs text-[#5A5148] font-mono truncate block">
                              {color.hex}
                            </span>
                          </div>
                        </div>

                        {isTraditional && (
                          <span className="mt-1.5 inline-block text-xs font-bold px-1.5 py-0.5 bg-[#D4EDDA] text-[#3E7D4F] border border-[#3E7D4F] rounded-xs">
                            Truyền thống
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* b) 1. ĐỘI ĐẦU (CHỌN 1) */}
              <div className="space-y-3 pt-4 border-t border-[#1E1B18]/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E1B18]">
                    👑 1. Đội đầu (chọn 1):
                  </label>
                  {selectedDoiDau && (
                    <button
                      type="button"
                      onClick={() => updateAccessoryGroup('doiDau', selectedDoiDau)}
                      className="text-xs text-[#B8321C] hover:underline cursor-pointer font-semibold"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {headwearItems.map((item: AccessoryOption) => {
                    const isSelected = selectedDoiDau === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateAccessoryGroup('doiDau', item.id)}
                        className={`p-2.5 border-2 text-left transition-all cursor-pointer relative rounded-md ${
                          isSelected
                            ? 'border-[#1E1B18] bg-[#EEF3FA] shadow-[2px_2px_0_#1E1B18]'
                            : 'border-[#1E1B18]/40 bg-[#F4EBD9] hover:border-[#1E1B18] hover:bg-[#ebdcc4]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-[#1E1B18] truncate">
                            {item.ten}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#2F4A7A] stroke-[3] shrink-0" />
                          )}
                        </div>
                        {item.nguon === 'remix' && (
                          <span className="mt-1.5 inline-block text-xs font-bold px-1.5 py-0.5 bg-[#DCE4F0] text-[#2F4A7A] border border-[#2F4A7A] rounded-xs">
                            Remix
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* c) 2. ĐIỂM NHẤN (CHỌN NHIỀU) */}
              <div className="space-y-3 pt-4 border-t border-[#1E1B18]/20">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E1B18]">
                  ✨ 2. Điểm nhấn (chọn nhiều):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {accentItems.map((item: AccessoryOption) => {
                    const isSelected = selectedTrangSuc.includes(item.id) || selectedHienDai.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateAccessoryGroup('diemNhan', item.id)}
                        className={`p-2.5 border-2 text-left transition-all cursor-pointer relative rounded-md ${
                          isSelected
                            ? 'border-[#1E1B18] bg-[#EEF3FA] shadow-[2px_2px_0_#1E1B18]'
                            : 'border-[#1E1B18]/40 bg-[#F4EBD9] hover:border-[#1E1B18] hover:bg-[#ebdcc4]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-[#1E1B18] truncate">
                            {item.ten}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#2F4A7A] stroke-[3] shrink-0" />
                          )}
                        </div>
                        {item.nguon === 'remix' && (
                          <span className="mt-1.5 inline-block text-xs font-bold px-1.5 py-0.5 bg-[#DCE4F0] text-[#2F4A7A] border border-[#2F4A7A] rounded-xs">
                            Remix
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR (<768px):
          "Tiếp: Giám định →" button pinned at bottom
      */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#FFFDF7] border-t-2 border-[#1E1B18] z-30 shadow-[0_-2px_0_#1E1B18]">
        <button
          type="button"
          onClick={() => navigateTo(3)}
          className="w-full btn-dongho py-2.5 bg-[#B8321C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_#1E1B18] rounded-lg"
        >
          <span>Tiếp: Giám định →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
