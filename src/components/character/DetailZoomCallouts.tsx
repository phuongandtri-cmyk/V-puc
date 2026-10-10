import React from 'react';
import { useApp } from '../../context/AppContext';
import { VIET_PHUC_GARMENTS, ACCESSORIES_DATABASE } from '../../data/vietPhucData';
import { ZoomIn, Sparkles } from 'lucide-react';

interface DetailZoomCalloutsProps {
  mode?: 'casual' | 'vietphuc';
}

const CASUAL_SWATCHES = [
  { name: 'Đen tóc than mộc', hex: '#231F20' },
  { name: 'Nâu hạt dẻ ấm', hex: '#5C3D32' },
  { name: 'Hồng phấn đào tự nhiên', hex: '#FCDBC7' },
  { name: 'Trắng cotton áo tee', hex: '#FFFFFF' },
  { name: 'Kem lanh nhạt', hex: '#F6F4ED' },
  { name: 'Xanh chàm denim', hex: '#355070' },
  { name: 'Xanh than đế sneaker', hex: '#263E5E' },
];

export const DetailZoomCallouts: React.FC<DetailZoomCalloutsProps> = ({ mode = 'casual' }) => {
  const { character, outfit } = useApp();

  const selectedGarment =
    VIET_PHUC_GARMENTS.find((g) => g.id === outfit.garmentId) || VIET_PHUC_GARMENTS[0];

  const footwearItem =
    ACCESSORIES_DATABASE.find((a) => a.id === outfit.accessories.footwear) ||
    ACCESSORIES_DATABASE[0];

  return (
    <div className="w-full bg-[#FFFDF7] p-3.5 border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18] space-y-3">
      <div className="flex items-center justify-between border-b-2 border-[#1E1B18] pb-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-1.5">
          <ZoomIn className="w-3.5 h-3.5 text-[#2F4A7A]" />
          CHI TIẾT ĐIỂM NHẤN (ZOOM CALLOUTS)
        </span>
        <span className="text-[10px] font-mono text-[#5A5148]">Độ phân giải Vector 1:1</span>
      </div>

      {/* Grid of 4 Zoom Nodes */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Node 1: Head / Face / Hair */}
        <div className="p-2 border border-[#1E1B18] bg-[#F4EBD9] flex items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-[#1E1B18] shrink-0 overflow-hidden bg-[#FFE7D1] flex items-center justify-center shadow-inner relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {character.gender === 'nu' ? (
                <>
                  <ellipse cx="50" cy="24" rx="16" ry="12" fill={character.hairColor} stroke="#1E1B18" strokeWidth="2.5" />
                  <circle cx="50" cy="55" r="28" fill={character.skinTone} stroke="#1E1B18" strokeWidth="2" />
                  <path d="M24 50 C24 32, 38 28, 50 28 C62 28, 76 32, 76 50 C70 42, 60 40, 50 40 C40 40, 30 42, 24 50 Z" fill={character.hairColor} stroke="#1E1B18" strokeWidth="2" />
                  <path d="M36 54 Q42 48 48 54" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M52 54 Q58 48 64 54" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="34" cy="62" rx="4" ry="2" fill="#D9442B" opacity="0.35" />
                  <ellipse cx="66" cy="62" rx="4" ry="2" fill="#D9442B" opacity="0.35" />
                </>
              ) : (
                <>
                  <circle cx="50" cy="55" r="28" fill={character.skinTone} stroke="#1E1B18" strokeWidth="2" />
                  <path d="M22 48 C22 26, 40 24, 50 24 C60 24, 78 26, 78 48 C72 38, 58 36, 50 44 C42 36, 28 38, 22 48 Z" fill={character.hairColor} stroke="#1E1B18" strokeWidth="2" />
                  <path d="M34 46 Q40 43 46 47" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
                  <path d="M54 47 Q60 43 66 46" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
                  <path d="M35 54 Q41 49 47 54" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M53 54 Q59 49 65 54" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M46 64 Q50 68 54 64" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase text-[#5A5148] block">1. Chi tiết Đầu</span>
            <span className="text-xs font-bold text-[#1E1B18] truncate block">
              {character.gender === 'nu' ? 'Búi thấp truyền thống' : 'Textured Quiff'}
            </span>
          </div>
        </div>

        {/* Node 2: Shirt / Garment */}
        <div className="p-2 border border-[#1E1B18] bg-[#F4EBD9] flex items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-[#1E1B18] shrink-0 overflow-hidden bg-[#FAF7EE] flex items-center justify-center shadow-inner relative">
            {mode === 'casual' ? (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M26 25 L74 25 L78 75 L22 75 Z" fill="#FAF7EE" stroke="#1E1B18" strokeWidth="2" />
                <path d="M36 25 C36 36, 64 36, 64 25 Z" fill="#FFFDF7" stroke="#1E1B18" strokeWidth="2" />
                <rect x="52" y="42" width="16" height="18" fill="#FAF7EE" stroke="#1E1B18" strokeWidth="2" />
                <line x1="52" y1="46" x2="68" y2="46" stroke="#1E1B18" strokeWidth="1.5" />
              </svg>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: outfit.primaryColor }}
              >
                <div className="w-4 h-4 bg-[#E9B824] border border-[#1E1B18]" />
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase text-[#5A5148] block">2. Chi tiết Áo</span>
            <span className="text-xs font-bold text-[#1E1B18] truncate block">
              {mode === 'casual' ? 'Tee trắng có túi' : selectedGarment.name}
            </span>
          </div>
        </div>

        {/* Node 3: Pants / Bottoms */}
        <div className="p-2 border border-[#1E1B18] bg-[#F4EBD9] flex items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-[#1E1B18] shrink-0 overflow-hidden bg-[#2A4572] flex items-center justify-center shadow-inner relative">
            {mode === 'casual' ? (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="18" y="24" width="64" height="12" fill="#2A4572" stroke="#1E1B18" strokeWidth="2" />
                <circle cx="50" cy="30" r="2.5" fill="#E9B824" stroke="#1E1B18" strokeWidth="1.2" />
                <line x1="50" y1="36" x2="50" y2="60" stroke="#1E1B18" strokeWidth="2" />
                <path d="M18 36 L48 36 L48 85 L20 85 Z" fill="#2A4572" stroke="#1E1B18" strokeWidth="2" />
                <path d="M52 36 L82 36 L80 85 L52 85 Z" fill="#2A4572" stroke="#1E1B18" strokeWidth="2" />
              </svg>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: outfit.pantColor }}
              >
                <div className="w-5 h-3 bg-[#1E1B18]/30" />
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase text-[#5A5148] block">3. Chi tiết Quần</span>
            <span className="text-xs font-bold text-[#1E1B18] truncate block">
              {mode === 'casual' ? 'Jeans xanh chàm' : 'Lụa hạ gấu'}
            </span>
          </div>
        </div>

        {/* Node 4: Shoes / Footwear */}
        <div className="p-2 border border-[#1E1B18] bg-[#F4EBD9] flex items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-[#1E1B18] shrink-0 overflow-hidden bg-[#FFFDF7] flex items-center justify-center shadow-inner relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M20 54 L60 54 C72 54, 84 62, 80 72 L16 72 Z" fill="#FFFDF7" stroke="#1E1B18" strokeWidth="2" />
              <rect x="14" y="72" width="68" height="8" fill="#F2EFE9" stroke="#1E1B18" strokeWidth="2" />
              <rect x="14" y="77" width="68" height="5" fill="#263E5E" stroke="#1E1B18" strokeWidth="1.5" />
              <line x1="42" y1="56" x2="54" y2="56" stroke="#1E1B18" strokeWidth="2" />
              <line x1="40" y1="62" x2="52" y2="62" stroke="#1E1B18" strokeWidth="2" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase text-[#5A5148] block">4. Chi tiết Giày</span>
            <span className="text-xs font-bold text-[#1E1B18] truncate block">
              {mode === 'casual' ? 'Sneaker retro trắng' : footwearItem.name}
            </span>
          </div>
        </div>
      </div>

      {/* Color Palette Swatches */}
      <div className="pt-2 border-t border-[#1E1B18]/20 flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-[#5A5148] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B824]" />
          Bảng màu phối chuẩn:
        </span>
        <div className="flex items-center gap-1.5">
          {CASUAL_SWATCHES.map((swatch) => (
            <span
              key={swatch.hex}
              className="w-4 h-4 rounded-full border border-[#1E1B18] shadow-xs transition-transform hover:scale-125"
              title={`${swatch.name} (${swatch.hex})`}
              style={{ backgroundColor: swatch.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
