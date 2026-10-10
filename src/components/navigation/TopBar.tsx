import React from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, Sparkles } from 'lucide-react';
import { ScreenId } from '../../types';

export const TopBar: React.FC = () => {
  const { currentScreen, navigateTo, resetToDefault } = useApp();

  const navItems: { id: ScreenId; label: string }[] = [
    { id: 1, label: '1. Nhân vật' },
    { id: 2, label: '2. Phối đồ' },
    { id: 3, label: '3. Giám định' },
    { id: 4, label: '4. Thẻ Lookbook' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF7] border-b-2 border-[#1E1B18] shadow-[0_2px_0_#1E1B18]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => navigateTo(1)}
          className="text-left font-display text-xl font-bold tracking-tight text-[#D9442B] hover:text-[#B8321C] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <span className="inline-block w-3 h-3 rounded-full bg-[#E9B824] border border-[#1E1B18]" />
          <span>Việt phục Remix</span>
        </button>

        {/* Zone 2: Clean 4 nav step links */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const isVisited = currentScreen > item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3 py-1 text-sm font-medium border-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#E9B824] text-[#1E1B18] border-[#1E1B18] font-bold shadow-[2px_2px_0_#1E1B18]'
                    : isVisited
                    ? 'bg-[#DCE4F0] text-[#1E1B18] border-[#1E1B18] hover:bg-[#c9d7e8]'
                    : 'bg-transparent text-[#5A5148] border-transparent hover:text-[#1E1B18] hover:border-[#1E1B18]/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            title="Khôi phục mặc định"
            className="p-1.5 text-xs font-semibold text-[#1E1B18] bg-[#F4EBD9] border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18] hover:bg-[#e8dcbf] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>

          <div className="px-2.5 py-1 text-xs font-bold bg-[#D9442B] text-white border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E9B824]" />
            <span>Bước {currentScreen}/4</span>
          </div>
        </div>
      </div>
    </header>
  );
};
