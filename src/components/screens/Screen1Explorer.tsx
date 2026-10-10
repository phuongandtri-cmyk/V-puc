import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChibiFigure } from '../character/ChibiFigure';
import {
  MALE_HAIRSTYLE_OPTIONS,
  DEFAULT_MALE_HAIR,
  normalizeMaleHairId,
} from '../character/MaleHair';
import {
  FEMALE_HAIRSTYLE_OPTIONS,
  DEFAULT_FEMALE_HAIR,
  normalizeFemaleHairId,
} from '../character/FemaleHair';
import { SKIN_TONES } from '../../data/vietPhucData';
import { Expression, HairStyle, Gender } from '../../types';
import { ArrowRight, User, Sliders, Info } from 'lucide-react';
import { WoodblockStamp } from '../common/WoodblockStamp';

export const Screen1Explorer: React.FC = () => {
  const { character, updateCharacter, outfit, navigateTo, saveCasualSnapshot } = useApp();

  const expressions: { id: Expression; label: string; icon: string }[] = [
    { id: 'vui', label: 'Vui vẻ', icon: '😄' },
    { id: 'cool', label: 'Cool ngầu', icon: '😎' },
    { id: 'dang-yeu', label: 'Đáng yêu', icon: '✨' },
    { id: 'kieu-ky', label: 'Trang nhã', icon: '🌸' },
  ];

  const activeHairStyles =
    character.gender === 'nu' ? FEMALE_HAIRSTYLE_OPTIONS : MALE_HAIRSTYLE_OPTIONS;

  // Normalize hairstyle so any old/unknown id immediately maps to a valid style
  React.useEffect(() => {
    if (character.gender === 'nam') {
      const normalized = normalizeMaleHairId(character.hairStyle);
      if (character.hairStyle !== normalized) {
        updateCharacter({ hairStyle: normalized });
      }
    } else {
      const normalized = normalizeFemaleHairId(character.hairStyle);
      if (character.hairStyle !== normalized) {
        updateCharacter({ hairStyle: normalized });
      }
    }
  }, [character.gender, character.hairStyle, updateCharacter]);

  const handleGenderChange = (newGender: Gender) => {
    if (newGender === character.gender) return;
    const defaultHair = newGender === 'nu' ? DEFAULT_FEMALE_HAIR : DEFAULT_MALE_HAIR;
    updateCharacter({ gender: newGender, hairStyle: defaultHair });
  };

  const handleProceedToStudio = () => {
    saveCasualSnapshot();
    navigateTo(2);
  };

  const hairColors = [
    { name: 'Đen mộc than', hex: '#1E1B18' },
    { name: 'Nâu vỏ dừa', hex: '#542E1F' },
    { name: 'Đỏ chu sa', hex: '#B8321C' },
    { name: 'Xanh chàm', hex: '#2F4A7A' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Banner Hero */}
      <section className="card-dongho-strong p-4 md:py-4 md:px-6 bg-[#FFFDF7] relative overflow-hidden">
        {/* Decorative Traditional Motif: Rolling clouds pattern (mây cuộn) */}
        <div className="absolute -top-2 right-0 w-44 md:w-60 h-28 md:h-32 pointer-events-none opacity-15 overflow-hidden z-0">
          <svg
            viewBox="0 0 240 120"
            fill="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Traditional Vietnamese rolling cloud scrolls */}
            <path
              d="M190 20 C175 6 150 8 140 22 C130 14 112 18 106 32 C92 32 80 44 82 60 C70 66 64 82 72 96 C84 106 106 104 114 96 C122 110 144 112 158 100 C172 112 198 108 206 92 C222 96 238 84 238 66 C238 50 226 38 210 38 C208 28 200 22 190 20 Z"
              stroke="#000000"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Inner cloud swirls / mây cuộn */}
            <path
              d="M170 45 C180 38 194 42 196 54 C198 64 188 72 176 70 C168 68 164 58 170 52 C174 48 182 50 182 56"
              stroke="#000000"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M120 55 C130 48 144 52 146 62 C148 72 138 80 128 78 C120 76 116 68 122 62 C125 58 132 60 132 66"
              stroke="#000000"
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M150 24 C162 16 178 22 180 34"
              stroke="#000000"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M95 50 C85 45 74 52 74 64"
              stroke="#000000"
              strokeWidth="1.8"
              fill="none"
            />
          </svg>
        </div>

        {/* Decorative Traditional Motif: Continuous water wave border (dải sóng nước / thủy ba) */}
        <div className="absolute bottom-0 left-0 right-0 h-3.5 md:h-4 pointer-events-none opacity-20 overflow-hidden z-0">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 600 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern id="thuy-ba-waves" width="50" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0 20 C12 6 18 4 25 10 C32 4 38 6 50 20"
                stroke="#000000"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M5 20 C14 10 18 8 25 14 C32 8 36 10 45 20"
                stroke="#000000"
                strokeWidth="1.2"
                fill="none"
              />
              <circle cx="25" cy="4" r="1.5" fill="#000000" />
            </pattern>
            <rect width="100%" height="20" fill="url(#thuy-ba-waves)" />
          </svg>
        </div>

        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <WoodblockStamp text="GEN Z x CỔ PHỤC" variant="yellow" size="sm" rotation={1} />
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1E1B18] leading-tight">
            Việt phục Remix: Khám phá & Phối Cổ phục Việt
          </h1>

          <p className="text-xs md:text-sm text-[#5A5148] leading-relaxed max-w-2xl">
            Hòa quyện di sản nghìn năm cùng nhịp thở đương đại. Tạo hình nhân vật, sáng tạo phối trang phục thời Lý - Trần - Lê - Nguyễn và khám phá quy tắc phục trang độc đáo.
          </p>

          <div className="pt-1 flex flex-wrap gap-3">
            <button
              onClick={handleProceedToStudio}
              className="btn-dongho px-4 py-2 bg-[#B8321C] text-white font-bold text-xs md:text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Vào Studio Phối Đồ Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2-Column Responsive Layout: Left Configuration, Right Chibi Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Character Sliders & Styling (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-dongho p-5 bg-[#FFFDF7] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#1E1B18] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-none border-2 border-[#1E1B18] bg-[#E9B824] flex items-center justify-center font-bold">
                  <User className="w-4 h-4 text-[#1E1B18]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E1B18]">Thiết lập Nhân vật Chibi</h2>
                  <p className="text-xs text-[#5A5148]">Tùy biến vóc dáng và thần thái cá nhân</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-[#DCE4F0] px-2 py-0.5 border border-[#1E1B18]">
                2D SVG Engine
              </span>
            </div>

            {/* Name & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Tên nhân vật / Biệt hiệu
                </label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateCharacter({ name: e.target.value })}
                  placeholder="Nhập tên nhân vật"
                  className="w-full px-3 py-2 text-sm border-2 border-[#1E1B18] bg-[#F4EBD9] focus:bg-[#FFFDF7] focus:outline-none font-semibold text-[#1E1B18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Khuôn mẫu Chibi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('nu')}
                    className={`py-2 px-3 text-center border-2 transition-all cursor-pointer ${
                      character.gender === 'nu'
                        ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]'
                        : 'bg-[#F4EBD9] text-[#1E1B18] border-[#1E1B18] hover:bg-[#e8dcbf]'
                    }`}
                  >
                    <div className="text-sm font-bold">Nữ</div>
                    <div className="text-[10px] text-[#5A5148] font-medium">Nữ nhi tao nhã</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('nam')}
                    className={`py-2 px-3 text-center border-2 transition-all cursor-pointer ${
                      character.gender === 'nam'
                        ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]'
                        : 'bg-[#F4EBD9] text-[#1E1B18] border-[#1E1B18] hover:bg-[#e8dcbf]'
                    }`}
                  >
                    <div className="text-sm font-bold">Nam</div>
                    <div className="text-[10px] text-[#5A5148] font-medium">Nam nhân tuấn kiệt</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sliders: Height and Weight with dynamic character proportion scaling */}
            <div className="space-y-4 pt-2 border-t border-[#1E1B18]/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#D9442B]" />
                  Tỷ lệ vóc dáng (Dynamic Scale)
                </span>
                <span className="text-xs text-[#5A5148] italic">Tự động điều chỉnh phom dáng SVG</span>
              </div>

              {/* Height Slider */}
              <div className="bg-[#F4EBD9] p-3 border-2 border-[#1E1B18]">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span>Chiều cao:</span>
                  <span className="font-mono bg-[#FFFDF7] px-2 py-0.5 border border-[#1E1B18] text-[#D9442B]">
                    {character.height} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="145"
                  max="190"
                  step="1"
                  value={character.height}
                  onChange={(e) => updateCharacter({ height: Number(e.target.value) })}
                  className="w-full accent-[#B8321C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#5A5148] mt-1 font-mono">
                  <span>145cm (Chibi mi nhon)</span>
                  <span>165cm (Chuẩn mực)</span>
                  <span>190cm (Thon dài kiêu hãnh)</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="bg-[#F4EBD9] p-3 border-2 border-[#1E1B18]">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span>Cân nặng / Độ phúng phính:</span>
                  <span className="font-mono bg-[#FFFDF7] px-2 py-0.5 border border-[#1E1B18] text-[#2F4A7A]">
                    {character.weight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="1"
                  value={character.weight}
                  onChange={(e) => updateCharacter({ weight: Number(e.target.value) })}
                  className="w-full accent-[#2F4A7A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#5A5148] mt-1 font-mono">
                  <span>40kg (Mảnh khảnh)</span>
                  <span>55kg (Cân đối)</span>
                  <span>95kg (Mũm mĩm tài lộc)</span>
                </div>
              </div>
            </div>

            {/* Skin Tone Selector */}
            <div className="space-y-2 pt-2 border-t border-[#1E1B18]/20">
              <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                Màu da tự nhiên
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SKIN_TONES.map((tone) => {
                  const isSelected = character.skinTone === tone.hex;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => updateCharacter({ skinTone: tone.hex })}
                      className={`p-2 border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1E1B18] bg-[#FFFDF7] shadow-[2px_2px_0_#1E1B18]'
                          : 'border-transparent bg-[#F4EBD9] hover:border-[#1E1B18]/40'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-[#1E1B18] shrink-0"
                        style={{ backgroundColor: tone.hex }}
                      />
                      <span className="text-xs font-medium truncate text-[#1E1B18]">{tone.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Facial Expression */}
            <div className="space-y-2 pt-2 border-t border-[#1E1B18]/20">
              <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                Biểu cảm khuôn mặt
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {expressions.map((exp) => {
                  const isSelected = character.expression === exp.id;
                  return (
                    <button
                      key={exp.id}
                      onClick={() => updateCharacter({ expression: exp.id })}
                      className={`py-2 px-3 border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]'
                          : 'bg-[#F4EBD9] text-[#5A5148] border-[#1E1B18] hover:bg-[#e8dcbf]'
                      }`}
                    >
                      <span className="mr-1">{exp.icon}</span>
                      <span>{exp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hair Style & Color */}
            <div className="space-y-3 pt-2 border-t border-[#1E1B18]/20">
              <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                Kiểu tóc
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeHairStyles.map((hs) => {
                  const currentHairId =
                    character.gender === 'nam'
                      ? normalizeMaleHairId(character.hairStyle)
                      : normalizeFemaleHairId(character.hairStyle);
                  const isSelected =
                    currentHairId === hs.id || character.hairStyle === hs.label;
                  return (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => updateCharacter({ hairStyle: hs.id })}
                      style={
                        isSelected
                          ? { backgroundColor: '#E9B824', border: '3px solid #000000' }
                          : { border: '2px solid #1E1B18' }
                      }
                      className={`py-2 px-2 text-xs transition-all cursor-pointer font-bold ${
                        isSelected
                          ? 'bg-[#E9B824] text-[#1E1B18] shadow-[2px_2px_0_#000000]'
                          : 'bg-[#F4EBD9] text-[#1E1B18] hover:bg-[#e8dcbf]'
                      }`}
                    >
                      {hs.label}
                    </button>
                  );
                })}
              </div>

              {/* Hair Color Chips */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-[#5A5148]">Màu tóc:</span>
                <div className="flex items-center gap-2">
                  {hairColors.map((hc) => (
                    <button
                      key={hc.hex}
                      onClick={() => updateCharacter({ hairColor: hc.hex })}
                      title={hc.name}
                      style={{ backgroundColor: hc.hex }}
                      className={`w-6 h-6 border-2 transition-transform cursor-pointer ${
                        character.hairColor === hc.hex
                          ? 'border-[#E9B824] scale-110 shadow-[2px_2px_0_#1E1B18]'
                          : 'border-[#1E1B18] hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Chibi Character Preview (5 cols on desktop) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="card-dongho-strong p-4 bg-[#FFFDF7] flex flex-col items-center relative">
            {/* Top Seal */}
            <div className="w-full flex items-center justify-between pb-3 border-b-2 border-[#1E1B18]">
              <span className="text-xs font-display font-bold text-[#D9442B] tracking-wider uppercase">
                BẢN XEM TRƯỚC NHÂN VẬT
              </span>
              <div className="text-[11px] font-mono font-bold bg-[#E9B824] px-2 py-0.5 border border-[#1E1B18]">
                {character.name.trim() || 'Nhân vật'}
              </div>
            </div>

            {/* Character Stage with decorative background frame */}
            <div className="w-full py-4 flex justify-center items-center bg-[#F4EBD9] border-2 border-[#1E1B18] my-3 relative overflow-hidden">
              {/* Paper texture and faint woodcut clouds */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="20" stroke="#1E1B18" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Chibi Character SVG */}
              <div className="relative z-10 flex justify-center items-center">
                <ChibiFigure
                  character={character}
                  size={290}
                />
              </div>

              {/* Dynamic tag overlay */}
              <div className="absolute bottom-2 left-2 z-20">
                <span className="text-[10px] font-mono font-bold bg-[#FFFDF7] border border-[#1E1B18] px-2 py-0.5 shadow-[1px_1px_0_#1E1B18]">
                  {character.height}cm · {character.weight}kg
                </span>
              </div>
            </div>

            {/* Quick action button to proceed */}
            <button
              onClick={handleProceedToStudio}
              className="w-full btn-dongho py-3 bg-[#B8321C] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>Tiến vào Bước 2: Phối Đồ & Phụ Kiện</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick guidance note */}
          <div className="card-dongho p-3 bg-[#DCE4F0] flex items-start gap-2 text-xs text-[#1E1B18]">
            <Info className="w-4 h-4 text-[#2F4A7A] shrink-0 mt-0.5" />
            <span>
              Mọi thay đổi vóc dáng của bạn đều được bảo toàn nguyên vẹn khi bạn điều hướng tới các bước kế tiếp hoặc quay lại.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
