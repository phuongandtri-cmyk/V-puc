/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/navigation/TopBar';
import { Screen1Explorer } from './components/screens/Screen1Explorer';
import { Screen2Studio } from './components/screens/Screen2Studio';
import { Screen3CultureGuard } from './components/screens/Screen3CultureGuard';
import { Screen4Lookbook } from './components/screens/Screen4Lookbook';
import { GeminiDebugButton } from './components/common/GeminiDebugButton';

const MainAppContent: React.FC = () => {
  const { currentScreen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EBD9] text-[#1E1B18]">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 py-6 md:py-8">
        {currentScreen === 1 && <Screen1Explorer />}
        {currentScreen === 2 && <Screen2Studio />}
        {currentScreen === 3 && <Screen3CultureGuard />}
        {currentScreen === 4 && <Screen4Lookbook />}
      </main>

      {/* Temporary Debug Button (DEBUG – remove before submission) */}
      <GeminiDebugButton />

      {/* Quiet Footer */}
      <footer className="w-full border-t-2 border-[#1E1B18] bg-[#FFFDF7] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5A5148]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#D9442B]">
              Việt phục Remix
            </span>
            <span>·</span>
            <span>Thẩm mỹ Tranh Dân Gian Đương Đại</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Phiên bản 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
