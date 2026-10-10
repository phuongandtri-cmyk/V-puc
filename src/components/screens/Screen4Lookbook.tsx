import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LookbookCard, FRAME_COLORS } from '../common/LookbookCard';
import { FACE_FIT } from '../../config/faceFit';
import { exportCardPng } from '../../lib/exportCard';
import { WoodblockStamp } from '../common/WoodblockStamp';
import { outfits } from '../../data/outfits';
import { colors, accessories } from '../../data/stylingOptions';
import { landmarks, landmarkUrl, Landmark } from '../../../data/landmarks';
import { VIET_PHUC_GARMENTS } from '../../data/vietPhucData';
import {
  Download,
  Share2,
  RotateCcw,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  Copy,
  ArrowLeftRight,
} from 'lucide-react';

const OCCASIONS: { id: string; label: string }[] = [
  { id: 'tet', label: 'Tết' },
  { id: 'ky-yeu', label: 'Kỷ yếu – Tốt nghiệp' },
  { id: 'le-hoi', label: 'Lễ hội' },
  { id: 'cuoi-hoi', label: 'Cưới hỏi' },
  { id: 'dao-pho', label: 'Dạo phố – Chụp ảnh' },
  { id: 'le-chua', label: 'Lễ chùa – Đình' },
];

export const Screen4Lookbook: React.FC = () => {
  const {
    character,
    outfit,
    cultureEvaluation,
    photoboothConfig,
    updatePhotoboothConfig,
    selectedOccasion,
    goBack,
    resetToDefault,
  } = useApp();

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'remix' | 'compare'>('remix');

  // Landmark resolution
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

  const groundY = selectedLandmark ? selectedLandmark.groundY : 0.92;
  const charHeight = selectedLandmark ? selectedLandmark.charHeight : 0.62;

  // Frame color resolution
  const currentFrameColorHex =
    photoboothConfig.frameColor ||
    FRAME_COLORS.find((f) => f.id === photoboothConfig.bgTheme)?.hex ||
    '#D9442B';

  const activeFrameOption =
    FRAME_COLORS.find((f) => f.hex === currentFrameColorHex) || FRAME_COLORS[0];

  // Outfit resolution
  const selectedGarment =
    VIET_PHUC_GARMENTS.find((g) => g.id === outfit.garmentId) ||
    VIET_PHUC_GARMENTS[0];
  const selectedOutfit = outfits.find((o) => o.id === outfit.garmentId);
  const outfitName = selectedOutfit?.ten || selectedGarment.name;
  const outfitEra = selectedOutfit?.thoiKy || selectedGarment.dynasty;

  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  // Accessories resolution (Real current state)
  const headwearItem = accessories.find((a) => a.id === outfit.accessories?.doiDau);
  const headwearText = headwearItem ? headwearItem.ten : 'Không';

  const accentIds = [
    ...(outfit.accessories?.trangSuc || []),
    ...(outfit.accessories?.hienDai || []),
  ];
  const accentNames = accentIds
    .map((id) => accessories.find((a) => a.id === id)?.ten)
    .filter(Boolean) as string[];
  const accentText = accentNames.length > 0 ? accentNames.join(', ') : 'Không';

  // Color & Pattern
  const colorOption = colors.find(
    (c) => c.id === outfit.colorId || c.hex === outfit.primaryColor
  );
  const colorText =
    outfit.colorId === 'mau-goc' ? 'Màu gốc' : colorOption?.ten || 'Màu gốc';

  // Landmark name
  const landmarkText = selectedLandmark ? selectedLandmark.ten : 'Nền trơn';

  // Occasion label
  const occasionOption = selectedOccasion
    ? OCCASIONS.find((o) => o.id === selectedOccasion)
    : null;
  const occasionText = occasionOption
    ? occasionOption.label
    : selectedOccasion || null;

  /**
   * Export card to PNG: captures the authentic on-screen Lookbook card node
   */
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    try {
      const cardEl = (cardRef.current || document.getElementById('lookbook-card')) as HTMLElement | null;
      if (!cardEl) return;
      const fileName = `VietPhucRemix_${character.name || 'Lookbook'}.png`;
      await exportCardPng(cardEl, fileName);
    } catch (e) {
      console.error('[Screen4Lookbook] Error generating card image:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLookDetails = () => {
    const lines = [
      `🎨 [VIỆT PHỤC REMIX]`,
      `Nhân vật: ${character.name || 'Vô Danh Nhân'} (${character.height}cm, ${character.weight}kg)`,
      `Cổ phục: ${outfitName} · ${outfitEra}`,
      `Đội đầu: ${headwearText}`,
      `Điểm nhấn: ${accentText}`,
      `Màu áo: ${colorText}`,
      `Bối cảnh: ${landmarkText}`,
    ];
    if (occasionText) {
      lines.push(`Dịp: ${occasionText}`);
    }
    lines.push(`Culture Guard: ${cultureEvaluation.label}`);
    lines.push(`"${photoboothConfig.caption || 'Hồn Cổ Phục Trong Nhịp Thở Phố'}"`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top congrats bar */}
      <div className="card-dongho p-4 bg-[#FFFDF7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WoodblockStamp text="BƯỚC 4" variant="red" size="sm" rotation={-1} />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1E1B18]">
              Thẻ Lookbook Việt Phục Remix Hoàn Tất!
            </h1>
            <p className="text-xs text-[#5A5148]">
              Tác phẩm mang phong cách dân gian sẵn sàng để lưu trữ và chia sẻ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLookDetails}
            className="px-3 py-1.5 border-2 border-[#1E1B18] bg-[#F4EBD9] hover:bg-[#ebdcc4] text-xs font-bold text-[#1E1B18] flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#1E1B18]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#3E7D4F]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép thông tin'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isDownloading}
            className="btn-dongho px-4 py-1.5 bg-[#B8321C] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Đang xuất PNG...' : 'Tải Thẻ (.PNG)'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column: Left Lookbook Card Render, Right Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The Authentic Lookbook Card (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="max-w-[480px] w-full space-y-4">
            {/* View Mode Toggle: Cổ phục Remix vs So sánh Trước & Sau (Casual snapshot) */}
            <div className="flex items-center justify-center gap-2 bg-[#F4EBD9] p-1.5 border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]">
              <button
                type="button"
                onClick={() => setViewMode('remix')}
                className={`flex-1 py-1 px-2 text-xs font-bold border transition-all cursor-pointer ${
                  viewMode === 'remix'
                    ? 'bg-[#B8321C] text-white border-[#1E1B18] shadow-[1px_1px_0_#1E1B18]'
                    : 'bg-[#FFFDF7] text-[#1E1B18] border-transparent hover:border-[#1E1B18]/30'
                }`}
              >
                Cổ phục Remix
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`flex-1 py-1 px-2 text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewMode === 'compare'
                    ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[1px_1px_0_#1E1B18]'
                    : 'bg-[#FFFDF7] text-[#1E1B18] border-transparent hover:border-[#1E1B18]/30'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>So sánh Trước & Sau</span>
              </button>
            </div>

            {/* Toggle: Chibi | Gương mặt thật (Show ONLY in step 4 next to the card when face cutout exists) */}
            {photoboothConfig.faceCutout && (
              <div className="flex items-center justify-between bg-[#FFFDF7] px-3 py-2 border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18] rounded-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={photoboothConfig.faceCutout.facePatchUrl || photoboothConfig.faceCutout.dataUrl}
                      alt="Gương mặt thật"
                      className="w-8 h-8 rounded-full object-cover border border-[#1E1B18]"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-[#1E1B18]"
                      style={{ backgroundColor: photoboothConfig.faceCutout.skinHex }}
                      title={`Màu da: ${photoboothConfig.faceCutout.skinHex}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#1E1B18] block leading-none">
                      Gương mặt nhân vật:
                    </span>
                    <span className="text-[10px] text-[#5A5148] block mt-0.5 truncate">
                      {photoboothConfig.useRealFace !== false
                        ? 'Đang hiển thị mặt thật'
                        : 'Đang hiển thị mặt Chibi'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#F4EBD9] p-1 border border-[#1E1B18] rounded shrink-0">
                  <button
                    type="button"
                    onClick={() => updatePhotoboothConfig({ useRealFace: false })}
                    className={`px-3 py-1 text-xs font-bold transition-all rounded cursor-pointer ${
                      photoboothConfig.useRealFace === false
                        ? 'bg-[#B8321C] text-white shadow-[1px_1px_0_#1E1B18]'
                        : 'bg-transparent text-[#1E1B18] hover:bg-[#E8DCBF]'
                    }`}
                  >
                    Chibi
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePhotoboothConfig({ useRealFace: true })}
                    className={`px-3 py-1 text-xs font-bold transition-all rounded cursor-pointer ${
                      photoboothConfig.useRealFace !== false
                        ? 'bg-[#E9B824] text-[#1E1B18] shadow-[1px_1px_0_#1E1B18]'
                        : 'bg-transparent text-[#1E1B18] hover:bg-[#E8DCBF]'
                    }`}
                  >
                    Gương mặt thật
                  </button>
                </div>
              </div>
            )}

            {/* SHARED LOOKBOOK CARD: Step 4 allows real face */}
            <LookbookCard
              cardRef={cardRef}
              allowRealFace={true}
              viewMode={viewMode}
              className="w-full"
            />

            {/* Debug Aid: print W, H, T, B, squash under the card (?debug=1, step 4 only) */}
            {isDebug && photoboothConfig.faceCutout && photoboothConfig.useRealFace !== false && (
              <div className="px-2.5 py-1.5 bg-[#1E1B18] text-[#FF00FF] font-mono text-xs rounded border border-[#FF00FF]/40 text-center shadow-xs">
                {(() => {
                  const R = 90;
                  const chinY = 260;
                  const isFem = character.gender === 'nu';
                  const style = character.hairStyle;
                  const fringeY = (() => {
                    switch (style) {
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
                  })();
                  const W = 2 * FACE_FIT.sideInset * R * FACE_FIT.fill;
                  const T = fringeY - FACE_FIT.topOverlap * R;
                  const B = chinY - FACE_FIT.chinInset * R;
                  let H = (B - T) * FACE_FIT.fill;
                  const photoW = photoboothConfig.faceCutout.photoFaceBoxWidth || 1;
                  const photoH = photoboothConfig.faceCutout.photoFaceBoxHeight || 1.25;
                  const naturalH = W * (photoH / photoW);
                  if (H < naturalH * FACE_FIT.maxSquash) {
                    H = naturalH * FACE_FIT.maxSquash;
                  }
                  const squash = (H / naturalH).toFixed(2);
                  return `W=${W.toFixed(1)}, H=${H.toFixed(1)}, T=${T.toFixed(1)}, B=${B.toFixed(1)}, squash=${squash}`;
                })()}
              </div>
            )}

            {/* INFO TABLE UNDER THE STEP-4 CARD */}
            <div className="p-3 border-2 border-[#1E1B18] bg-[#F4EBD9] shadow-[3px_3px_0_#1E1B18] space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-[#1E1B18]/20 pb-1.5">
                <span className="font-bold text-[#1E1B18]">Nhân vật:</span>
                <span className="font-display font-bold text-sm text-[#D9442B]">
                  {character.name || 'Vô Danh Nhân'} ({character.height}cm · {character.weight}kg)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5148] font-medium">Cổ phục:</span>
                <span className="font-bold text-[#1E1B18] text-right">
                  {outfitName} · {outfitEra}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5148] font-medium">Đội đầu:</span>
                <span className="font-semibold text-[#1E1B18] text-right">
                  {headwearText}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5148] font-medium">Điểm nhấn:</span>
                <span className="font-semibold text-[#1E1B18] text-right">
                  {accentText}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5148] font-medium">Màu áo:</span>
                <span className="font-semibold text-[#1E1B18] text-right">
                  {colorText}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5148] font-medium">Bối cảnh:</span>
                <span className="font-semibold text-[#1E1B18] text-right">
                  {landmarkText}
                </span>
              </div>

              {occasionText && (
                <div className="flex justify-between items-center">
                  <span className="text-[#5A5148] font-medium">Dịp:</span>
                  <span className="font-semibold text-[#1E1B18] text-right">
                    {occasionText}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Seal */}
            <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-[#5A5148]">
              <span>V-REMIX ENGINE</span>
              <span>© 2026 VIỆT PHỤC REMIX</span>
            </div>
          </div>
        </div>

        {/* Right Column: Actions, Evaluation Summary & Cultural Sharing (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Action Card */}
          <div className="card-dongho-strong p-5 bg-[#FFFDF7] space-y-4">
            <h2 className="text-base font-bold text-[#1E1B18] border-b-2 border-[#1E1B18] pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D9442B]" />
              <span>Hành động với Thẻ Lookbook</span>
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="w-full btn-dongho py-3 bg-[#B8321C] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>
                  {isDownloading
                    ? 'Đang chuẩn bị ảnh PNG...'
                    : 'Tải Thẻ Lookbook Đầy Đủ (.PNG)'}
                </span>
              </button>

              <button
                onClick={handleCopyLookDetails}
                className="w-full px-4 py-2.5 border-2 border-[#1E1B18] bg-[#E9B824] text-[#1E1B18] font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_#1E1B18] hover:bg-[#dfad1e]"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#1E1B18]" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>
                  {copied
                    ? 'Đã chép nội dung thẻ!'
                    : 'Sao chép văn bản Lookbook để chia sẻ'}
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#1E1B18]/20 flex gap-2">
              <button
                onClick={goBack}
                className="flex-1 py-2 px-3 border-2 border-[#1E1B18] bg-[#F4EBD9] hover:bg-[#ebdcc4] text-xs font-bold text-[#1E1B18] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Chỉnh sửa thêm</span>
              </button>

              <button
                onClick={resetToDefault}
                className="flex-1 py-2 px-3 border-2 border-[#1E1B18] bg-[#FFFDF7] hover:bg-[#eee] text-xs font-bold text-[#1E1B18] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D9442B]" />
                <span>Phối bộ mới từ đầu</span>
              </button>
            </div>
          </div>

          {/* Certificate of Cultural Harmony Card */}
          <div className="card-dongho p-5 bg-[#FFFDF7] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-[#1E1B18] pb-2">
              <ShieldCheck className="w-4 h-4 text-[#3E7D4F]" />
              <h3 className="text-sm font-bold text-[#1E1B18]">
                Chứng chỉ Hài hòa Văn hóa (Culture Guard)
              </h3>
            </div>

            <div className="text-xs space-y-2 text-[#1E1B18]">
              <p>
                <strong>Mức độ kiểm định:</strong> {cultureEvaluation.label}
              </p>
              <p className="text-[#5A5148] leading-relaxed">
                {cultureEvaluation.matches.length > 0
                  ? cultureEvaluation.matches[0].giaiThich
                  : 'Chưa phát hiện điểm sai lệch văn hóa.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
