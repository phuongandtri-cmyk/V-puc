import React, { useState, useEffect } from 'react';
import { testGemini, MODEL_NAME, subscribeGeminiCallCount } from '../../services/storyteller';
import { Wrench, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export const GeminiDebugButton: React.FC = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [callCount, setCallCount] = useState(0);
  const [result, setResult] = useState<{ status: 'idle' | 'success' | 'failure'; message: string }>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebugMode(params.get('debug') === '1');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeGeminiCallCount((count) => {
      setCallCount(count);
    });
    return unsubscribe;
  }, []);

  if (!isDebugMode) {
    return null;
  }

  const handleTest = async () => {
    setTesting(true);
    setResult({ status: 'idle', message: '' });

    try {
      const data = await testGemini();
      setResult({
        status: 'success',
        message: `✅ Gemini OK – model: ${data.modelName || MODEL_NAME}`,
      });
    } catch (err: any) {
      console.error('[GeminiTest]', err);
      const errMsg = err?.message || String(err);
      setResult({
        status: 'failure',
        message: `❌ ${MODEL_NAME} – ${errMsg}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-auto bg-[#1E1B18] text-[#F4EBD9] border-2 border-[#E9B824] rounded-lg shadow-xl max-w-xs font-mono">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer bg-[#2A2622] rounded-t-lg select-none text-xs font-bold text-[#E9B824]"
      >
        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5" />
          <span>DEBUG TOOLS (?debug=1)</span>
        </div>
        <button
          type="button"
          aria-label={isCollapsed ? 'Mở rộng debug' : 'Thu gọn debug'}
          className="text-[#F4EBD9] hover:text-[#E9B824]"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-2 border-t border-[#F4EBD9]/20 text-xs">
          {/* Call counter */}
          <div className="flex items-center justify-between bg-[#141210] px-2.5 py-1.5 rounded border border-[#F4EBD9]/20">
            <span className="text-[#F4EBD9]/80">Lượt gọi Gemini:</span>
            <span className="font-bold text-[#E9B824] text-sm">{callCount}</span>
          </div>

          {/* Test button */}
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#B8321C] hover:bg-[#9c2714] text-white font-bold rounded border border-[#1E1B18] shadow active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5 text-[#E9B824]" />}
            <span>🔧 Kiểm tra Gemini</span>
          </button>

          {/* Result readout */}
          {result.status !== 'idle' && (
            <div
              className={`p-2 text-xs rounded border break-all ${
                result.status === 'success'
                  ? 'bg-[#3E7D4F]/90 text-white border-green-700'
                  : 'bg-red-900/90 text-white border-red-700'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
