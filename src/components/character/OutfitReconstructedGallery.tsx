import React, { useState, useEffect, useRef } from 'react';
import {
  outfitImages,
  imageUrl,
  ViewKey,
  VIEW_LABELS,
} from '../../data/outfitImages';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

interface OutfitReconstructedGalleryProps {
  outfitId: string;
  characterGender: 'nam' | 'nu';
}

const VIEW_ORDER: ViewKey[] = [
  'truoc',
  '3-4',
  'nghieng',
  'nghieng-trai',
  'sau',
  'sau-3-4',
];

export const OutfitReconstructedGallery: React.FC<OutfitReconstructedGalleryProps> = ({
  outfitId,
  characterGender,
}) => {
  const imageSet = outfitImages[outfitId];

  // Available genders for this outfit
  const availableGenders = React.useMemo(() => {
    if (!imageSet) return [];
    const genders: ('nam' | 'nu')[] = [];
    if (imageSet.nam && Object.keys(imageSet.nam).length > 0) genders.push('nam');
    if (imageSet.nu && Object.keys(imageSet.nu).length > 0) genders.push('nu');
    return genders;
  }, [imageSet]);

  // Selected gender: default to character gender if available, else first available
  const [selectedGender, setSelectedGender] = useState<'nam' | 'nu'>('nam');

  useEffect(() => {
    if (availableGenders.length === 0) return;
    if (availableGenders.includes(characterGender)) {
      setSelectedGender(characterGender);
    } else {
      setSelectedGender(availableGenders[0]);
    }
  }, [characterGender, availableGenders, outfitId]);

  // Available views for the selected gender
  const currentGenderViews = imageSet?.[selectedGender];
  const availableViewKeys = React.useMemo(() => {
    if (!currentGenderViews) return [];
    return VIEW_ORDER.filter((key) => Boolean(currentGenderViews[key]));
  }, [currentGenderViews]);

  // Active view: default to "truoc" if available, else first available
  const [activeView, setActiveView] = useState<ViewKey>('truoc');

  // Active accessory (if tapped, shows accessory in main image instead of view)
  const [activePhuKienId, setActivePhuKienId] = useState<string | null>(null);

  // Reset active view / phuKien on outfit or gender change
  useEffect(() => {
    setActivePhuKienId(null);
    if (availableViewKeys.includes('truoc')) {
      setActiveView('truoc');
    } else if (availableViewKeys.length > 0) {
      setActiveView(availableViewKeys[0]);
    }
  }, [outfitId, selectedGender, availableViewKeys]);

  // Image load state & error
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  // Compute the current active image file
  const activeFile = React.useMemo(() => {
    if (activePhuKienId && imageSet?.phuKien) {
      const pk = imageSet.phuKien.find((item) => item.id === activePhuKienId);
      if (pk) return pk.file;
    }
    if (currentGenderViews && activeView) {
      return currentGenderViews[activeView] || null;
    }
    return null;
  }, [activePhuKienId, imageSet, currentGenderViews, activeView]);

  const activeSrc = activeFile ? imageUrl(activeFile) : null;

  // Reset loaded/error when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [activeSrc, retryNonce]);

  // Preload next and previous view
  useEffect(() => {
    if (activePhuKienId || availableViewKeys.length <= 1 || !currentGenderViews) return;
    const currentIndex = availableViewKeys.indexOf(activeView);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % availableViewKeys.length;
    const nextKey = availableViewKeys[nextIndex];
    const nextFile = currentGenderViews[nextKey];
    if (nextFile) {
      const img = new Image();
      img.src = imageUrl(nextFile);
    }

    const prevIndex = (currentIndex - 1 + availableViewKeys.length) % availableViewKeys.length;
    const prevKey = availableViewKeys[prevIndex];
    const prevFile = currentGenderViews[prevKey];
    if (prevFile) {
      const img = new Image();
      img.src = imageUrl(prevFile);
    }
  }, [activeView, availableViewKeys, currentGenderViews, activePhuKienId]);

  // Navigation handlers
  const handleNext = () => {
    if (availableViewKeys.length <= 1) return;
    setActivePhuKienId(null);
    const currentIndex = availableViewKeys.indexOf(activeView);
    const nextIndex = (currentIndex + 1) % availableViewKeys.length;
    setActiveView(availableViewKeys[nextIndex]);
  };

  const handlePrev = () => {
    if (availableViewKeys.length <= 1) return;
    setActivePhuKienId(null);
    const currentIndex = availableViewKeys.indexOf(activeView);
    const prevIndex = (currentIndex - 1 + availableViewKeys.length) % availableViewKeys.length;
    setActiveView(availableViewKeys[prevIndex]);
  };

  // Touch swipe support for mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // If the outfit has no entry (e.g. giao-linh): show "Ảnh phục dựng đang được hoàn thiện." and nothing else.
  if (!imageSet || availableGenders.length === 0) {
    return (
      <div className="p-8 text-center text-xs md:text-sm text-[#5A5148] italic font-medium">
        Ảnh phục dựng đang được hoàn thiện.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Top Controls: Gender toggle (if > 1 gender) & View tabs */}
      <div className="flex flex-col gap-2">
        {/* Gender Toggle: only show genders that exist for this outfit */}
        {availableGenders.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5A5148] shrink-0">Giới tính:</span>
            <div className="inline-flex border-2 border-[#1E1B18] bg-[#EAE2D2] p-0.5 rounded gap-1">
              {availableGenders.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setSelectedGender(g);
                  }}
                  className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer rounded-sm ${
                    selectedGender === g
                      ? 'bg-[#1E1B18] text-[#FBF7EE] shadow-[1px_1px_0_#1E1B18]'
                      : 'text-[#1E1B18] hover:bg-[#DDD3C0]'
                  }`}
                >
                  {g === 'nam' ? 'Nam' : 'Nữ'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View buttons built from available keys, labeled with VIEW_LABELS */}
        {availableViewKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {availableViewKeys.map((key) => {
              const isActive = activePhuKienId === null && activeView === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActivePhuKienId(null);
                    setActiveView(key);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold border-2 transition-all cursor-pointer rounded ${
                    isActive
                      ? 'bg-[#2F4A7A] text-white border-[#1E1B18] shadow-[1.5px_1.5px_0_#1E1B18]'
                      : 'bg-[#FFFDF7] text-[#1E1B18] border-[#1E1B18]/40 hover:border-[#1E1B18] hover:bg-[#F4EBD9]'
                  }`}
                >
                  {VIEW_LABELS[key] || key}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Image Container: square, object-fit contain, paper bg #F4EBD9, border 2px #1E1B18, radius 12px */}
      <div
        className="relative w-full aspect-square bg-[#F4EBD9] border-2 border-[#1E1B18] rounded-[12px] overflow-hidden select-none flex items-center justify-center shadow-[2px_2px_0_#1E1B18]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main image with 150ms crossfade */}
        {activeSrc && !hasError && (
          <img
            key={activeSrc + '-' + retryNonce}
            src={activeSrc}
            alt="Ảnh phục dựng"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setIsLoaded(false);
              setHasError(true);
            }}
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-150 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Loading Spinner */}
        {!isLoaded && !hasError && activeSrc && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-3 border-[#2F4A7A]/30 border-t-[#2F4A7A] rounded-full animate-spin" />
          </div>
        )}

        {/* Error state with retry button */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-[#F4EBD9]">
            <AlertCircle className="w-6 h-6 text-[#B8321C]" />
            <span className="text-xs md:text-sm font-semibold text-[#1E1B18]">
              Không tải được ảnh
            </span>
            <button
              type="button"
              onClick={() => setRetryNonce((n) => n + 1)}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FFFDF7] text-[#1E1B18] border-2 border-[#1E1B18] rounded shadow-[2px_2px_0_#1E1B18] hover:bg-[#EAE2D2] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Left Arrow Button */}
        {availableViewKeys.length > 1 && !activePhuKienId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Góc nhìn trước"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] border-2 border-[#1E1B18] shadow-[1px_1px_0_#1E1B18] flex items-center justify-center text-[#1E1B18] cursor-pointer active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {availableViewKeys.length > 1 && !activePhuKienId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Góc nhìn kế tiếp"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] border-2 border-[#1E1B18] shadow-[1px_1px_0_#1E1B18] flex items-center justify-center text-[#1E1B18] cursor-pointer active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Row of small thumbnails if phuKien exists, titled "Món đi kèm" */}
      {imageSet.phuKien && imageSet.phuKien.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-[#1E1B18]/15">
          <span className="text-xs font-bold text-[#5A5148] block">Món đi kèm:</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {imageSet.phuKien.map((pk) => {
              const isSelected = activePhuKienId === pk.id;
              const pkUrl = imageUrl(pk.file);
              return (
                <button
                  key={pk.id}
                  type="button"
                  onClick={() => {
                    setActivePhuKienId(isSelected ? null : pk.id);
                  }}
                  className={`flex flex-col items-center gap-1 p-1 bg-[#FFFDF7] border-2 rounded-lg cursor-pointer transition-all shrink-0 w-18 text-center ${
                    isSelected
                      ? 'border-[#2F4A7A] shadow-[2px_2px_0_#2F4A7A] bg-[#EAEBF4]'
                      : 'border-[#1E1B18]/30 hover:border-[#1E1B18] shadow-[1px_1px_0_#1E1B18]'
                  }`}
                >
                  <div className="w-14 h-14 bg-[#F4EBD9] border border-[#1E1B18]/20 rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={pkUrl}
                      alt={pk.ten}
                      className="w-full h-full object-contain pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#1E1B18] leading-tight line-clamp-1 w-full px-0.5">
                    {pk.ten}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Caption under the image (small, muted) */}
      <div className="text-xs text-[#5A5148] leading-relaxed pt-1 border-t border-[#1E1B18]/15 space-y-1">
        <p>
          Ảnh phục dựng minh họa bằng AI, đội đã đối chiếu với tư liệu; chi tiết có thể chưa tuyệt đối chính xác.
        </p>
        {imageSet.ghiChu && (
          <p className="italic text-[#1E1B18] font-medium">
            {imageSet.ghiChu}
          </p>
        )}
      </div>
    </div>
  );
};
