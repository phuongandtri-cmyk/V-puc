import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChibiFigure } from '../character/ChibiFigure';
import { WoodblockStamp } from '../common/WoodblockStamp';
import { VIET_PHUC_GARMENTS } from '../../data/vietPhucData';
import { BasisLine } from './Screen2Studio';
import { outfits } from '../../data/outfits';
import { colors, accessories, AccessoryOption } from '../../data/stylingOptions';
import { landmarks, landmarkUrl, Landmark } from '../../../data/landmarks';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Camera,
  ArrowLeft,
  AlertTriangle,
  Info,
  Award,
  Upload,
  MapPin,
  Wand2,
  X,
  ChevronDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { processFaceCutout } from '../../lib/faceCutout';

let rememberedStep3Tab: 'giam-dinh' | 'photobooth' = 'giam-dinh';

import { LookbookCard, FRAME_COLORS } from '../common/LookbookCard';

const LandmarkThumbnail: React.FC<{ chibiBg?: string; alt: string }> = ({ chibiBg, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!chibiBg || hasError) {
    return (
      <div className="w-[56px] h-[70px] shrink-0 bg-[#FFFDF7] border border-[#1E1B18] flex flex-col items-center justify-center p-1 rounded-xs">
        <MapPin className="w-5 h-5 text-[#B8321C]" />
      </div>
    );
  }

  return (
    <div className="w-[56px] h-[70px] shrink-0 border border-[#1E1B18] overflow-hidden rounded-xs bg-[#FFFDF7] relative">
      <img
        src={landmarkUrl(chibiBg)}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
};

export const Screen3CultureGuard: React.FC = () => {
  const {
    character,
    outfit,
    cultureEvaluation,
    photoboothConfig,
    updatePhotoboothConfig,
    isGeneratingPhotobooth,
    photoboothProgressText,
    photoboothPercent,
    triggerPhotobooth,
    goBack,
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'giam-dinh' | 'photobooth'>(
    rememberedStep3Tab
  );

  const setActiveTab = (tab: 'giam-dinh' | 'photobooth') => {
    rememberedStep3Tab = tab;
    setActiveTabState(tab);
  };

  const [consentGiven, setConsentGiven] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Landmark selection
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

  // Debug flag (?debug=1)
  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

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

  const selectedGarment =
    VIET_PHUC_GARMENTS.find((g) => g.id === outfit.garmentId) || VIET_PHUC_GARMENTS[0];

  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [faceNote, setFaceNote] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceError(null);
      setFaceNote(null);
      setIsDetectingFace(true);

      const reader = new FileReader();
      reader.onload = async () => {
        const rawDataUrl = reader.result as string;
        try {
          const result = await processFaceCutout(rawDataUrl);
          updatePhotoboothConfig({
            userFaceImage: rawDataUrl,
            faceCutout: result,
            useRealFace: true,
          });
          if (result.note) {
            setFaceNote(result.note);
          }
        } catch (err: any) {
          console.error('Face detection failed:', err);
          setFaceError(err.message || 'Không tìm thấy gương mặt. Hãy dùng ảnh chụp chính diện, đủ sáng.');
          // Still save raw userFaceImage for photobooth AI prompt reference if needed, but no cutout
          updatePhotoboothConfig({
            userFaceImage: rawDataUrl,
            faceCutout: null,
            useRealFace: false,
          });
        } finally {
          setIsDetectingFace(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const landmarkPromptHint = isPlainBg
    ? 'against a traditional minimalist Do paper background'
    : selectedLandmark
    ? selectedLandmark.promptHint
    : 'in front of historical Vietnamese heritage';

  const synthesizedPrompt = `Photorealistic 8k portrait preserving user facial features, dressed in authentic Vietnamese traditional ${selectedGarment.name} (${selectedGarment.dynasty} period). Premium ${outfit.primaryColor} silk fabric, traditional tailored collar. Standing elegantly ${landmarkPromptHint}. Body proportions: ${character.height}cm, ${character.weight}kg (${character.gender === 'nu' ? 'Female' : 'Male'} silhouette). Gen Z neo-traditional lookbook aesthetic, soft studio lighting, ultra-high resolution.`;

  // Resolved Chips data mirroring Step 2
  const selectedOutfit = outfits.find((o) => o.id === outfit.garmentId);
  const selectedColorName =
    outfit.colorId === 'mau-goc'
      ? 'Màu gốc'
      : colors.find((c) => c.id === outfit.colorId || c.hex === outfit.primaryColor)?.ten || 'Đỏ son';

  const selectedAccItems: AccessoryOption[] = [];
  const selectedDoiDau = outfit.accessories?.doiDau;
  const selectedTrangSuc = outfit.accessories?.trangSuc || [];
  const selectedHienDai = outfit.accessories?.hienDai || [];

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

  const verdictExplanation =
    cultureEvaluation.matches.length > 0
      ? cultureEvaluation.matches[0].giaiThich
      : 'Chưa phát hiện điểm sai lệch văn hóa. Trang phục được kết hợp hài hòa và trang trọng.';

  return (
    <div className="w-full pb-24 md:pb-8">
      {/* Photobooth Loading Overlay */}
      {isGeneratingPhotobooth && (
        <div className="fixed inset-0 z-50 bg-[#1E1B18]/85 flex items-center justify-center p-4">
          <div className="card-dongho-strong max-w-md w-full p-6 bg-[#FFFDF7] text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-3 border-[#1E1B18] bg-[#E9B824] flex items-center justify-center animate-bounce shadow-[3px_3px_0_#1E1B18]">
              <Camera className="w-8 h-8 text-[#1E1B18]" />
            </div>

            <div className="space-y-1">
              <WoodblockStamp text="KHẮC IN DÂN GIAN" variant="red" size="sm" rotation={-2} />
              <h3 className="text-xl font-bold font-display text-[#1E1B18]">
                Đang In Bản Mộc Photobooth...
              </h3>
              <p className="text-xs text-[#5A5148] min-h-[36px] flex items-center justify-center">
                {photoboothProgressText}
              </p>
            </div>

            <div className="w-full bg-[#F4EBD9] border-2 border-[#1E1B18] h-6 p-0.5 relative">
              <div
                className="bg-[#D9442B] h-full transition-all duration-300 border-r-2 border-[#1E1B18]"
                style={{ width: `${photoboothPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#1E1B18]">
                {photoboothPercent}%
              </span>
            </div>

            <div className="pt-2 text-[11px] text-[#5A5148] italic border-t border-[#1E1B18]/15">
              Quy trình in 5 màu mộc mạc mô phỏng nghệ nhân tranh dân gian truyền thống
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN GRID (≥ 768px): mirrors Step 2 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(340px,40%)] gap-6 max-w-[1280px] mx-auto w-full items-start">
        {/* RIGHT COLUMN = RESULT PANEL: Desktop Right (Column 2), Mobile Top (order-1) */}
        <div className="w-full order-1 md:order-2 md:sticky md:top-[72px] md:h-[calc(100vh-88px)]">
          <div className="card-dongho-strong bg-[#FFFDF7] p-4 border-3 border-[#1E1B18] shadow-[5px_5px_0_#1E1B18] rounded-xl flex flex-col justify-between h-full overflow-hidden relative">
            {/* Header: label "THẺ LOOKBOOK" + Culture Guard verdict badge */}
            <div className="w-full flex items-center justify-between pb-2 border-b-2 border-[#1E1B18] shrink-0">
              <span className="font-display font-bold text-xs md:text-sm text-[#2F4A7A] uppercase tracking-wider">
                Thẻ Lookbook
              </span>
              <div
                className="btn-dongho px-2.5 py-1 text-xs font-bold flex items-center gap-1.5"
                style={{
                  backgroundColor: cultureEvaluation.badgeColor,
                  color: cultureEvaluation.textColor,
                }}
              >
                {cultureEvaluation.level === 'xanh' ? (
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : cultureEvaluation.level === 'vang' ? (
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{cultureEvaluation.label}</span>
              </div>
            </div>

            {/* Shared Lookbook Card */}
            <LookbookCard className="my-3 min-h-[340px] md:min-h-0" />

            {/* Summary chips */}
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

            {/* Bottom Actions */}
            <div className="w-full pt-3 shrink-0 space-y-2">
              <button
                type="button"
                onClick={triggerPhotobooth}
                className="w-full btn-dongho py-2.5 bg-[#B8321C] text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0_#1E1B18] rounded-lg hover:bg-[#9c2714]"
              >
                <Camera className="w-4 h-4" />
                <span>Chụp & Khắc In Thẻ Lookbook (3s)</span>
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full px-4 py-2 border-2 border-[#1E1B18] bg-[#F4EBD9] hover:bg-[#ebdcc4] text-[#1E1B18] font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0_#1E1B18] rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Quay lại chỉnh phối đồ</span>
              </button>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Desktop Left (Column 1), Mobile Bottom (order-2) */}
        <div className="order-2 md:order-1 flex flex-col gap-4 min-w-0 w-full">
          {/* Top Card: BƯỚC 3 tag + Title + Verdict info */}
          <div className="card-dongho p-3 md:p-3.5 bg-[#FFFDF7] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-[#1E1B18] shadow-[3px_3px_0_#1E1B18]">
            <div className="flex items-center gap-2 shrink-0">
              <WoodblockStamp text="BƯỚC 3" variant="yellow" size="sm" rotation={-1} />
              <h1 className="font-display font-bold text-base md:text-lg text-[#1E1B18] tracking-tight">
                Hệ thống Kiểm định Culture Guard
              </h1>
            </div>

            <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-start sm:justify-end">
              <div
                className="w-10 h-10 border-2 border-[#1E1B18] flex items-center justify-center shadow-[2px_2px_0_#1E1B18] shrink-0 rounded"
                style={{
                  backgroundColor: cultureEvaluation.badgeColor,
                  color: cultureEvaluation.textColor,
                }}
              >
                {cultureEvaluation.level === 'xanh' ? (
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                ) : cultureEvaluation.level === 'vang' ? (
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>

              <div className="min-w-0 max-w-sm text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#5A5148]">
                    KẾT LUẬN GIÁM ĐỊNH:
                  </span>
                  <span
                    className="px-2 py-0.5 border border-[#1E1B18] text-xs font-bold uppercase font-display shadow-[1px_1px_0_#1E1B18] rounded-xs"
                    style={{
                      backgroundColor: cultureEvaluation.badgeColor,
                      color: cultureEvaluation.textColor,
                    }}
                  >
                    {cultureEvaluation.label}
                  </span>
                </div>
                <p
                  className="text-xs text-[#1E1B18] truncate mt-0.5"
                  title={verdictExplanation}
                >
                  {verdictExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* 2 Tabs: "Giám định" & "Photobooth" */}
          <div className="flex border-2 border-[#1E1B18] bg-[#F4EBD9] p-1 gap-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('giam-dinh')}
              className={`flex-1 py-2 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded ${
                activeTab === 'giam-dinh'
                  ? 'bg-[#B8321C] text-white shadow-[2px_2px_0_#1E1B18]'
                  : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Giám định</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photobooth')}
              className={`flex-1 py-2 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded ${
                activeTab === 'photobooth'
                  ? 'bg-[#B8321C] text-white shadow-[2px_2px_0_#1E1B18]'
                  : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photobooth</span>
            </button>
          </div>

          {/* Tab Content Card */}
          <div className="card-dongho p-4 md:p-5 bg-[#FFFDF7] rounded-xl border-3 border-[#1E1B18] shadow-[4px_4px_0_#1E1B18] min-h-[440px]">
            {/* TAB 1: Giám định (Merged: Tiêu chí + Bối cảnh lịch sử + Lời khuyên ứng xử) */}
            {activeTab === 'giam-dinh' && (
              <div className="space-y-4">
                {/* (a) Tiêu chí Đánh giá Văn hóa Chi tiết */}
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-[#1E1B18] border-b-2 border-[#1E1B18] pb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D9442B]" />
                    <span>Tiêu chí Đánh giá Văn hóa Chi tiết</span>
                  </h2>

                  <div className="space-y-3">
                    {cultureEvaluation.matches.length === 0 ? (
                      <div className="p-4 border-2 border-[#1E1B18] bg-[#F0F7F2] text-xs text-[#1E1B18] flex items-center gap-2 rounded">
                        <ShieldCheck className="w-5 h-5 text-[#3E7D4F] shrink-0" />
                        <span className="font-medium">Chưa phát hiện điểm sai lệch văn hóa. Bộ phối hài hòa!</span>
                      </div>
                    ) : (
                      cultureEvaluation.matches.map((rule) => {
                        const ruleBg =
                          rule.mucDo === 'do'
                            ? 'bg-[#FFF0F0] border-[#8E1B1B]'
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
                              <span className={`px-2 py-0.5 text-[10px] font-bold border border-[#1E1B18] ${tagColor}`}>
                                {rule.mucDo === 'do'
                                  ? '✕ Chưa phù hợp'
                                  : rule.mucDo === 'vang'
                                  ? '! Cân nhắc'
                                  : '✓ Hài hòa'}
                              </span>
                            </div>

                            <p className="font-bold text-xs text-[#1E1B18] leading-snug">
                              {rule.giaiThich}
                            </p>

                            <p className="text-xs text-[#1E1B18] leading-snug">
                              <span className="font-semibold text-[#5A5148]">Gợi ý: </span>
                              {rule.goiYSua}
                            </p>

                            <BasisLine rule={rule} selectedOutfitId={outfit.garmentId} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* (b) Bối cảnh Lịch sử Cổ phục (Pink box) */}
                <div className="p-3.5 border-2 border-[#1E1B18] bg-[#FFF5F3] rounded">
                  <span className="font-bold text-[#D9442B] block mb-1 text-xs">
                    🏛️ Bối cảnh Lịch sử Cổ phục:
                  </span>
                  <p className="text-[#1E1B18] leading-relaxed text-xs">
                    {selectedGarment.name} ({selectedGarment.dynasty}) — {selectedGarment.significance || selectedGarment.description}
                  </p>
                </div>

                {/* (c) Lời khuyên Ứng xử theo Bối cảnh (Blue box) */}
                <div className="p-3.5 border-2 border-[#1E1B18] bg-[#EEF3FA] rounded">
                  <span className="font-bold text-[#2F4A7A] block mb-1 text-xs">
                    ⛩️ Lời khuyên Ứng xử theo Bối cảnh:
                  </span>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-[#1E1B18]">
                    <li>
                      <strong>Đi lễ đền chùa / Nhà thờ họ:</strong> Nên giữ trọn sự tôn nghiêm, ưu tiên khăn vấn lụa, guốc mộc, tháo kính râm và tai nghe ra khỏi khung hình cúng bái.
                    </li>
                    <li>
                      <strong>Dạo phố / Chụp ảnh thời trang (Lookbook):</strong> Tự do bung tỏa cá tính cùng sneaker, túi tote canvas và kính râm để lan tỏa tình yêu cổ phục tới bạn bè quốc tế.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: Photobooth */}
            {activeTab === 'photobooth' && (
              <div className="space-y-4">
                {/* 1. Bối cảnh danh thắng lịch sử: 3-column grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2F4A7A]" />
                    Bối cảnh danh thắng lịch sử:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {landmarks.map((l) => {
                      const isSelected = currentLandmarkId === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            updatePhotoboothConfig({
                              landmarkId: l.id,
                              landmarkScene: l.id,
                            });
                          }}
                          className={`p-2 border-2 text-left transition-all cursor-pointer rounded flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0_#1E1B18] font-bold'
                              : 'bg-[#F4EBD9] text-[#5A5148] border-[#1E1B18]/40 hover:bg-[#e8dcbf] hover:border-[#1E1B18]'
                          }`}
                        >
                          <LandmarkThumbnail chibiBg={l.chibiBg} alt={l.ten} />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-[#1E1B18] block truncate">
                              {l.ten}
                            </span>
                            <span className="text-[10px] text-[#5A5148] block line-clamp-2 mt-0.5 leading-snug">
                              {l.moTa}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* Option: Nền trơn */}
                    <button
                      type="button"
                      onClick={() => {
                        updatePhotoboothConfig({
                          landmarkId: 'nen-tron',
                          landmarkScene: 'nen-tron',
                        });
                      }}
                      className={`p-2 border-2 text-left transition-all cursor-pointer rounded flex items-center gap-2.5 ${
                        isPlainBg
                          ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0_#1E1B18] font-bold'
                          : 'bg-[#F4EBD9] text-[#5A5148] border-[#1E1B18]/40 hover:bg-[#e8dcbf] hover:border-[#1E1B18]'
                      }`}
                    >
                      <div className="w-[56px] h-[70px] shrink-0 bg-[#FFFDF7] border border-[#1E1B18] flex flex-col items-center justify-center p-1 rounded-xs">
                        <Sparkles className="w-5 h-5 text-[#B8321C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#1E1B18] block truncate">
                          Nền trơn
                        </span>
                        <span className="text-[10px] text-[#5A5148] block line-clamp-2 mt-0.5 leading-snug">
                          Màu giấy điệp truyền thống, không ảnh cảnh
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Ảnh chân dung (tùy chọn) with consent checkbox */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#C84B31]" />
                      Ảnh chân dung (tùy chọn):
                    </span>
                    <span className="text-[10px] text-[#5A5148] font-normal">Tùy chọn tạo ảnh AI</span>
                  </label>

                  {/* Consent Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer select-none p-2 bg-[#F4EBD9]/60 border border-[#1E1B18]/30 rounded">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-[#1E1B18] text-[#B8321C] focus:ring-0 cursor-pointer accent-[#B8321C]"
                    />
                    <span className="text-xs text-[#1E1B18] font-medium leading-relaxed">
                      Tôi đồng ý dùng ảnh khuôn mặt của mình để AI tạo ảnh. Ảnh không được lưu lại.
                    </span>
                  </label>

                  {/* Detection progress indicator */}
                  {isDetectingFace && (
                    <div className="p-3 bg-[#FFFDF7] border-2 border-[#1E1B18] rounded flex items-center justify-center gap-2 text-xs font-bold text-[#1E1B18] shadow-[2px_2px_0_#1E1B18]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#C84B31]" />
                      <span>Đang nhận diện gương mặt…</span>
                    </div>
                  )}

                  {/* Face error message */}
                  {faceError && !isDetectingFace && (
                    <div className="p-2.5 bg-[#FDE8E8] border-2 border-[#D9442B] rounded text-xs text-[#D9442B] font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{faceError}</span>
                    </div>
                  )}

                  {/* Multiple faces detected note */}
                  {faceNote && !isDetectingFace && (
                    <div className="p-2 bg-[#FEF3C7] border-2 border-[#E9B824] rounded text-[11px] text-[#92400E] font-medium flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{faceNote}</span>
                    </div>
                  )}

                  {photoboothConfig.userFaceImage ? (
                    <div className="flex items-center gap-4 p-3 bg-[#F4EBD9] border-2 border-[#1E1B18] rounded-lg">
                      <div className="relative shrink-0">
                        <img
                          src={photoboothConfig.faceCutout ? (photoboothConfig.faceCutout.facePatchUrl || photoboothConfig.faceCutout.dataUrl) : photoboothConfig.userFaceImage}
                          alt="Ảnh chân dung"
                          className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[#1E1B18] bg-[#FFFDF7] shadow-xs"
                        />
                        {photoboothConfig.faceCutout && (
                          <span
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-[#1E1B18] shadow-xs"
                            style={{ backgroundColor: photoboothConfig.faceCutout.skinHex }}
                            title={`Màu da nhận diện: ${photoboothConfig.faceCutout.skinHex}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#3E7D4F] block">
                          {photoboothConfig.faceCutout
                            ? 'Đã nhận diện gương mặt ✓ — sẽ hiển thị ở Bước 4'
                            : 'Đã nạp ảnh chân dung'}
                        </span>
                        <span className="text-[10px] text-[#5A5148] block mt-0.5">
                          {photoboothConfig.faceCutout
                            ? 'Ảnh chỉ xuất hiện trên Thẻ Lookbook hoàn tất tại Bước 4.'
                            : 'Ảnh chỉ lưu trong bộ nhớ tạm'}
                        </span>

                        {/* Options: Bộ lọc tranh & Đồng bộ màu da theo ảnh */}
                        {photoboothConfig.faceCutout && (
                          <div className="mt-2.5 pt-2 border-t border-[#1E1B18]/15 space-y-1.5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={photoboothConfig.paintFilterEnabled !== false}
                                onChange={(e) =>
                                  updatePhotoboothConfig({
                                    paintFilterEnabled: e.target.checked,
                                  })
                                }
                                className="w-3.5 h-3.5 rounded border border-[#1E1B18] text-[#B8321C] focus:ring-0 cursor-pointer accent-[#B8321C]"
                              />
                              <span className="text-xs text-[#1E1B18] font-medium">
                                Bộ lọc tranh (Đông Hồ Pop)
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={photoboothConfig.applyPhotoSkin !== false}
                                onChange={(e) =>
                                  updatePhotoboothConfig({
                                    applyPhotoSkin: e.target.checked,
                                  })
                                }
                                className="w-3.5 h-3.5 rounded border border-[#1E1B18] text-[#B8321C] focus:ring-0 cursor-pointer accent-[#B8321C]"
                              />
                              <span className="text-xs text-[#1E1B18] font-medium flex items-center gap-1.5">
                                <span>Đồng bộ màu da theo ảnh</span>
                                <span
                                  className="inline-block w-3 h-3 rounded-full border border-[#1E1B18]"
                                  style={{ backgroundColor: photoboothConfig.faceCutout.skinHex }}
                                  title={photoboothConfig.faceCutout.skinHex}
                                />
                              </span>
                            </label>
                          </div>
                        )}

                        <div className="mt-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFaceError(null);
                              setFaceNote(null);
                              updatePhotoboothConfig({
                                userFaceImage: null,
                                faceCutout: null,
                                useRealFace: false,
                              });
                            }}
                            className="px-2.5 py-1 text-xs font-bold border-2 border-[#1E1B18] bg-[#FFFDF7] hover:bg-[#D9442B] hover:text-white text-[#1E1B18] rounded cursor-pointer transition-colors flex items-center gap-1.5 shadow-[1px_1px_0_#1E1B18]"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Xóa ảnh</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (consentGiven && !isDetectingFace) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`border-2 border-dashed border-[#1E1B18] p-3.5 text-center rounded transition-all ${
                        consentGiven && !isDetectingFace
                          ? 'bg-[#F4EBD9]/70 hover:bg-[#F4EBD9] cursor-pointer'
                          : 'bg-[#E8E1D2]/40 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        disabled={!consentGiven || isDetectingFace}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 mx-auto text-[#5A5148] mb-1.5" />
                      <span className="text-xs font-bold text-[#1E1B18] block">
                        Bấm để tải ảnh khuôn mặt của bạn
                      </span>
                      <span className="text-[10px] text-[#5A5148] block mt-0.5">
                        {consentGiven
                          ? 'Tự động cắt khuôn mặt & ghép lên nhân vật (MediaPipe AI)'
                          : 'Vui lòng xác nhận đồng ý ở trên để mở khóa tải ảnh'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Lời đề tặng trên thẻ Lookbook (max 40 chars, live counter) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                      Lời đề tặng trên thẻ Lookbook:
                    </label>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        (photoboothConfig.caption || '').length >= 40
                          ? 'text-[#D9442B]'
                          : 'text-[#5A5148]'
                      }`}
                    >
                      {(photoboothConfig.caption || '').length}/40
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    value={photoboothConfig.caption || ''}
                    onChange={(e) => updatePhotoboothConfig({ caption: e.target.value })}
                    placeholder="Ví dụ: Nét duyên cổ phục giữa lòng phố thị..."
                    className="w-full px-3 py-2 text-xs border-2 border-[#1E1B18] bg-[#F4EBD9] focus:bg-[#FFFDF7] font-medium rounded outline-none"
                  />
                </div>

                {/* 4. Màu khung thẻ: 4 options in ONE row */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                    Màu khung thẻ:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FRAME_COLORS.map((color) => {
                      const isSelected = currentFrameColorHex === color.hex;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() =>
                            updatePhotoboothConfig({
                              frameColor: color.hex,
                              bgTheme: color.id as any,
                            })
                          }
                          className={`p-2 border-2 text-left transition-all cursor-pointer rounded ${
                            isSelected
                              ? 'border-[#1E1B18] bg-[#FFFDF7] shadow-[2px_2px_0_#1E1B18] font-bold'
                              : 'border-[#1E1B18]/30 bg-[#F4EBD9] hover:border-[#1E1B18]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 border border-[#1E1B18] shrink-0 rounded-xs"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs font-bold text-[#1E1B18] truncate">
                              {color.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Collapsed section: 🔍 Minh bạch AI – xem chỉ dẫn sẽ gửi cho AI */}
                <div className="border-2 border-[#1E1B18] rounded bg-[#1E1B18]/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAiPrompt((prev) => !prev)}
                    className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-[#1E1B18] bg-[#F4EBD9] hover:bg-[#ebdcc4] cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🔍 Minh bạch AI – xem chỉ dẫn sẽ gửi cho AI</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showAiPrompt ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showAiPrompt && (
                    <div className="p-3 bg-[#1E1B18] text-[#FFFDF7] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#E9B824]">
                        <span className="flex items-center gap-1 font-bold">
                          <Wand2 className="w-3 h-3" />
                          Chỉ dẫn tạo ảnh
                        </span>
                        <span>Structured Prompt</span>
                      </div>
                      <p className="text-[10px] font-mono text-[#DCE4F0] leading-relaxed">
                        {synthesizedPrompt}
                      </p>
                    </div>
                  )}
                </div>

                {/* 6. Chụp Photobooth (3s) button right-aligned */}
                <div className="flex justify-end pt-2 border-t border-[#1E1B18]/15">
                  <button
                    type="button"
                    onClick={triggerPhotobooth}
                    className="btn-dongho px-6 py-2.5 bg-[#B8321C] text-white font-bold text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow-[3px_3px_0_#1E1B18] rounded-lg hover:bg-[#9c2714]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Chụp Photobooth (3s)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
