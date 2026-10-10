import React, { useState, useEffect, useRef } from 'react';
import { Outfit, Gender } from '../../data/outfits';
import { CharacterConfig, OutfitConfig, CultureGuardEvaluation } from '../../types';
import {
  streamStory,
  askQuestion,
  searchMore,
  WebSource,
  StoryContext,
  ChatTurn,
  getLocalCachedStory,
} from '../../services/storyteller';
import {
  ExternalLink,
  RotateCcw,
  Globe,
  Sparkles,
  BookOpen,
  Camera,
  Send,
  Check,
} from 'lucide-react';
import { OutfitReconstructedGallery } from './OutfitReconstructedGallery';

interface TaggedLine {
  id: string;
  type: 'TU_LIEU' | 'GOI_Y';
  text: string;
}

interface ChatTurnExchange {
  id: string;
  question: string;
  answers: TaggedLine[];
  isLoading: boolean;
  error?: string | null;
  rawError?: string | null;
  isQuota?: boolean;
}

interface MergedOutfitCardProps {
  selectedOutfit: Outfit | null;
  character: CharacterConfig;
  outfit: OutfitConfig;
  cultureEvaluation: CultureGuardEvaluation;
  selectedOccasion: string | null;
  activeSubTab: 'storyteller' | 'sources' | 'reconstructed';
  setActiveSubTab: (tab: 'storyteller' | 'sources' | 'reconstructed') => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

const getDefaultQuestions = (outfit: Outfit): string[] => {
  if (outfit.id === 'giao-linh') {
    return [
      'Áo giao lĩnh vạt phải đè vạt trái đúng không?',
      'Tại sao áo giao lĩnh có xẻ tà hai bên hông?',
      'Thuê áo giao lĩnh ở đâu, giá bao nhiêu?',
    ];
  }
  if (outfit.id === 'vien-linh') {
    return [
      'Thuê áo viên lĩnh ở đâu, giá bao nhiêu?',
      'Bổ tử trên áo Viên lĩnh có ý nghĩa gì?',
      'Áo Viên lĩnh thường được mặc vào dịp nào?',
    ];
  }
  if (outfit.id === 'nhat-binh') {
    return [
      'Ý nghĩa dải ngũ sắc ở tay áo Nhật Bình là gì?',
      'Ai được mặc áo Nhật Bình thời triều Nguyễn?',
      'Áo Nhật Bình phối với phụ kiện đương đại nào hợp?',
    ];
  }
  if (outfit.id === 'ngu-than-lap-co' || outfit.id === 'ao-tac') {
    return [
      'Năm chiếc khuy trên áo ngũ thân tượng trưng cho điều gì?',
      'Thuê áo ngũ thân ở đâu, giá bao nhiêu?',
      'Áo ngũ thân tay chẽn khác áo Tấc thế nào?',
    ];
  }
  return [
    `Ý nghĩa biểu tượng của ${outfit.ten} là gì?`,
    `${outfit.ten} phù hợp mặc trong những dịp nào?`,
    `Có thể phối phụ kiện hiện đại nào với ${outfit.ten}?`,
  ];
};

export const MergedOutfitCard: React.FC<MergedOutfitCardProps> = ({
  selectedOutfit,
  character,
  outfit,
  cultureEvaluation,
  selectedOccasion,
  activeSubTab,
  setActiveSubTab,
  cardRef,
}) => {
  // Storyteller state
  const [streamedLines, setStreamedLines] = useState<TaggedLine[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isStreamingStory, setIsStreamingStory] = useState(false);
  const [storyError, setStoryError] = useState<{ message: string; raw?: string; isQuota?: boolean } | null>(null);

  // Q&A turns
  const [chatList, setChatList] = useState<ChatTurnExchange[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Web search state
  const [webResult, setWebResult] = useState<{ text: string; sources: WebSource[] } | null>(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webError, setWebError] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const prevOutfitIdRef = useRef<string | undefined>(selectedOutfit?.id);

  // Parse lines into tagged bubbles
  const parseRawLine = (rawLine: string): { tagged?: TaggedLine; question?: string[] } | null => {
    const line = rawLine.trim();
    if (!line) return null;

    if (line.startsWith('CAU_HOI:')) {
      const qText = line.replace('CAU_HOI:', '').trim();
      const qs = qText
        .split('|')
        .map((q) => q.trim())
        .filter(Boolean)
        .slice(0, 3);
      return { question: qs };
    }

    let type: 'TU_LIEU' | 'GOI_Y' = 'GOI_Y';
    let text = line;

    if (line.startsWith('[TU_LIEU]')) {
      type = 'TU_LIEU';
      text = line.replace('[TU_LIEU]', '').trim();
    } else if (line.startsWith('[GOI_Y]')) {
      type = 'GOI_Y';
      text = line.replace('[GOI_Y]', '').trim();
    }

    return {
      tagged: {
        id: `${Date.now()}-${Math.random()}`,
        type,
        text,
      },
    };
  };

  // Helper to load or stream general story
  const loadOutfitStory = async (outfitId: string, isPersonalized = false) => {
    setIsStreamingStory(true);
    setStoryError(null);

    const fullCtx: StoryContext = {
      gioiTinh: character.gender,
      suKien: selectedOccasion || null,
      mau: outfit.primaryColor,
      phuKien: [
        outfit.accessories.doiDau,
        outfit.accessories.giay,
        ...(outfit.accessories.trangSuc || []),
        ...(outfit.accessories.hienDai || []),
      ].filter(Boolean) as string[],
      cultureGuard: {
        level: cultureEvaluation.level,
        messages: cultureEvaluation.matches.map((m) => m.giaiThich),
      },
    };

    // If general (not personalized), check local cache first for instant rendering
    if (!isPersonalized) {
      const cached = getLocalCachedStory(outfitId, character.gender);
      if (cached && cached.length > 0) {
        const lines: TaggedLine[] = [];
        let questions: string[] = [];

        for (const line of cached) {
          const parsed = parseRawLine(line);
          if (parsed?.question && parsed.question.length > 0) {
            questions = parsed.question;
          } else if (parsed?.tagged) {
            lines.push(parsed.tagged);
          }
        }

        setStreamedLines(lines);
        if (selectedOutfit) {
          setSuggestedQuestions(questions.length > 0 ? questions : getDefaultQuestions(selectedOutfit));
        }
        setIsStreamingStory(false);
        return;
      }
    }

    // Call streamStory (will stream from server or server cache)
    const result = await streamStory(
      outfitId,
      fullCtx,
      (line) => {
        const parsed = parseRawLine(line);
        if (parsed?.question && parsed.question.length > 0) {
          setSuggestedQuestions(parsed.question);
        } else if (parsed?.tagged) {
          setStreamedLines((prev) => [...prev, parsed.tagged!]);
        }
      },
      { isPersonalized }
    );

    setIsStreamingStory(false);

    if (!result.success) {
      if (result.isQuota) {
        setStoryError({
          message:
            '✦ Gemini đã dùng hết lượt miễn phí hôm nay. Phần tư liệu bên trên vẫn đầy đủ, bạn quay lại sau nhé.',
          raw: result.error || 'RESOURCE_EXHAUSTED / 429',
          isQuota: true,
        });
      } else if (result.error && result.error !== 'Aborted') {
        setStoryError({
          message: 'Gemini chưa phản hồi được, thử lại nhé.',
          raw: result.error,
          isQuota: false,
        });
      }
    } else {
      if (selectedOutfit) {
        setSuggestedQuestions((prev) => (prev.length > 0 ? prev : getDefaultQuestions(selectedOutfit)));
      }
    }
  };

  // Whenever selectedOutfit changes
  useEffect(() => {
    if (!selectedOutfit) {
      prevOutfitIdRef.current = undefined;
      setStreamedLines([]);
      setSuggestedQuestions([]);
      setChatList([]);
      setWebResult(null);
      setWebError(null);
      setStoryError(null);
      return;
    }

    if (prevOutfitIdRef.current !== selectedOutfit.id) {
      prevOutfitIdRef.current = selectedOutfit.id;
      setStreamedLines([]);
      setSuggestedQuestions([]);
      setChatList([]);
      setWebResult(null);
      setWebError(null);
      setStoryError(null);

      loadOutfitStory(selectedOutfit.id, false);
    } else if (streamedLines.length === 0 && !isStreamingStory && !storyError) {
      loadOutfitStory(selectedOutfit.id, false);
    }
  }, [selectedOutfit?.id]);

  // Scroll to bottom on new lines or chats in Storyteller view
  useEffect(() => {
    if (activeSubTab === 'storyteller' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [streamedLines, chatList, isStreamingStory, webResult, activeSubTab]);

  // Handle Personalized Remix Suggestion ("↻ Gợi ý lại theo bộ phối")
  const handleRegeneratePersonalized = () => {
    if (!selectedOutfit) return;
    setStreamedLines([]);
    setStoryError(null);
    loadOutfitStory(selectedOutfit.id, true);
  };

  // Handle Q&A asking
  const handleAsk = async (questionText: string) => {
    if (!selectedOutfit) return;
    const q = questionText.trim();
    if (!q || isSubmittingQuestion) return;

    setCustomQuestion('');
    setIsSubmittingQuestion(true);

    const exchangeId = `turn_${Date.now()}`;
    const newExchange: ChatTurnExchange = {
      id: exchangeId,
      question: q,
      answers: [],
      isLoading: true,
    };

    setChatList((prev) => {
      const next = [...prev, newExchange];
      return next.slice(-6); // Keep last 6 turns
    });

    // Build chat history for Gemini
    const history: ChatTurn[] = chatList.flatMap((c) => [
      { role: 'user', text: c.question },
      ...c.answers.map((a) => ({ role: 'model' as const, text: a.text })),
    ]);

    const result = await askQuestion(selectedOutfit.id, history, q, (line) => {
      const parsed = parseRawLine(line);
      if (parsed?.tagged) {
        setChatList((prev) =>
          prev.map((item) =>
            item.id === exchangeId
              ? { ...item, answers: [...item.answers, parsed.tagged!] }
              : item
          )
        );
      }
    });

    setIsSubmittingQuestion(false);

    setChatList((prev) =>
      prev.map((item) => {
        if (item.id !== exchangeId) return item;
        if (!result.success) {
          if (result.isQuota) {
            return {
              ...item,
              isLoading: false,
              isQuota: true,
              error:
                '✦ Gemini đã dùng hết lượt miễn phí hôm nay. Phần tư liệu bên trên vẫn đầy đủ, bạn quay lại sau nhé.',
              rawError: result.error,
            };
          }
          return {
            ...item,
            isLoading: false,
            error: 'Gemini chưa phản hồi được, thử lại nhé.',
            rawError: result.error,
          };
        }
        return { ...item, isLoading: false };
      })
    );
  };

  // Handle Google Search Grounding ("🌐 Tìm thêm trên web")
  const handleSearchWeb = async () => {
    if (!selectedOutfit) return;
    if (isSearchingWeb) return;
    setIsSearchingWeb(true);
    setWebError(null);

    const lastQuestion =
      chatList.length > 0 ? chatList[chatList.length - 1].question : `Tìm hiểu thêm về ${selectedOutfit.ten}`;

    const res = await searchMore(selectedOutfit.id, lastQuestion);
    setIsSearchingWeb(false);

    if (res.error && !res.text) {
      setWebError(res.error);
    } else {
      setWebResult({
        text: res.text,
        sources: res.sources || [],
      });
    }
  };

  const formatGender = (gender: Gender): string => {
    if (gender === 'nam') return 'Nam';
    if (gender === 'nu') return 'Nữ';
    return 'Nam & Nữ';
  };

  const hasValidDetail = (val?: string): boolean => {
    if (!val) return false;
    return !val.trim().toLowerCase().startsWith('không có dữ liệu');
  };

  // Instant Diem Nhan Dien rows (up to 3)
  const getInstantHighlights = (item: Outfit): string[] => {
    const list: string[] = [];
    if (hasValidDetail(item.diemNhanDien?.coAo)) list.push(`Cổ áo: ${item.diemNhanDien.coAo}`);
    if (hasValidDetail(item.diemNhanDien?.chieuVat)) list.push(`Chiều vạt: ${item.diemNhanDien.chieuVat}`);
    if (hasValidDetail(item.diemNhanDien?.cachCai)) list.push(`Cách cài: ${item.diemNhanDien.cachCai}`);
    else if (hasValidDetail(item.diemNhanDien?.tayAo)) list.push(`Tay áo: ${item.diemNhanDien.tayAo}`);
    else if (hasValidDetail(item.diemNhanDien?.doDaiVaLop)) list.push(`Độ dài & lớp: ${item.diemNhanDien.doDaiVaLop}`);
    return list.slice(0, 3);
  };

  if (!selectedOutfit) {
    return (
      <div
        ref={cardRef}
        className="card-dongho-strong bg-[#FFFDF7] border-3 border-[#1E1B18] shadow-[4px_4px_0_#1E1B18] rounded-xl flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-[#F4EBD9] border-2 border-[#1E1B18] flex items-center justify-center mb-3 text-[#B8321C]">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="font-display font-bold text-base md:text-lg text-[#1E1B18]">
          Chưa chọn cổ phục
        </h3>
        <p className="text-xs md:text-sm text-[#5A5148] max-w-sm mt-1">
          Vui lòng chọn một bộ cổ phục từ danh sách phía trên để xem hồ sơ trang phục và trò chuyện cùng Người kể chuyện Gemini.
        </p>
      </div>
    );
  }

  const instantHighlights = getInstantHighlights(selectedOutfit);
  const displayQuestions =
    suggestedQuestions.length > 0 ? suggestedQuestions : getDefaultQuestions(selectedOutfit);

  return (
    <div
      ref={cardRef}
      className="card-dongho-strong bg-[#FFFDF7] border-3 border-[#1E1B18] shadow-[4px_4px_0_#1E1B18] rounded-xl flex flex-col overflow-hidden"
    >
      {/* HEADER: Outfit Name (Baloo 2, 20px) + tenKhac + Gender + Verification Badge */}
      <div className="p-4 border-b-2 border-[#1E1B18] bg-[#FFFDF7]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#D9442B] uppercase tracking-wider">
                HỒ SƠ TRANG PHỤC
              </span>
              <span>·</span>
              <span className="text-xs text-[#5A5148]">{selectedOutfit.thoiKy}</span>
            </div>
            <h2 className="font-display font-bold text-[20px] text-[#1E1B18] leading-snug">
              {selectedOutfit.ten}
            </h2>
            {selectedOutfit.tenKhac && selectedOutfit.tenKhac.length > 0 && (
              <p className="text-xs text-[#5A5148] italic mt-0.5">
                Tên khác: {selectedOutfit.tenKhac.join(', ')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-2 py-0.5 bg-[#F4EBD9] border border-[#1E1B18] text-[#2F4A7A]">
              {formatGender(selectedOutfit.gioiTinh)}
            </span>
            {selectedOutfit.trangThai === 'da-duyet' ? (
              <span className="text-xs font-bold px-2 py-0.5 bg-[#D4EDDA] text-[#3E7D4F] border border-[#3E7D4F]">
                ✓ Đã kiểm chứng
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 bg-[#E5DFD3] text-[#5A5148] border border-[#5A5148]/40">
                Đang kiểm chứng
              </span>
            )}
          </div>
        </div>

        {/* SUB-TABS: "✦ Người kể chuyện" | "📜 Tư liệu & nguồn" | "📷 Ảnh phục dựng" */}
        <div className="flex border-2 border-[#1E1B18] bg-[#F4EBD9] p-1 gap-1 mt-3.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('storyteller')}
            className={`flex-1 py-1.5 px-2 md:px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              activeSubTab === 'storyteller'
                ? 'bg-[#B8321C] text-white shadow-[2px_2px_0_#1E1B18]'
                : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E9B824] shrink-0" />
            <span className="truncate">✦ Người kể chuyện</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sources')}
            className={`flex-1 py-1.5 px-2 md:px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              activeSubTab === 'sources'
                ? 'bg-[#2F4A7A] text-white shadow-[2px_2px_0_#1E1B18]'
                : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">📜 Tư liệu & nguồn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('reconstructed')}
            className={`flex-1 py-1.5 px-2 md:px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              activeSubTab === 'reconstructed'
                ? 'bg-[#3E7D4F] text-white shadow-[2px_2px_0_#1E1B18]'
                : 'text-[#1E1B18] hover:bg-[#e8dcbf]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">📷 Ảnh phục dựng</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ✦ Người kể chuyện */}
      <div
        style={{ display: activeSubTab === 'storyteller' ? 'flex' : 'none' }}
        className="flex-col flex-1"
      >
        {/* Scrollable Story Content Area (Max height 520px with its own scroll) */}
        <div
          ref={chatScrollRef}
          className="max-h-[520px] overflow-y-auto p-4 bg-[#F4EBD9] space-y-3 flex-1"
        >
          {/* Instant bubbles from outfits.ts */}
          {/* 1. yNghia */}
          <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 text-xs md:text-sm leading-relaxed shadow-[2px_2px_0_#1E1B18]">
            <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#3E7D4F] text-white">
              ✓ Từ tư liệu
            </span>
            <p className="text-[#1E1B18]">{selectedOutfit.yNghia}</p>
          </div>

          {/* 2. Điểm nhận diện highlights (up to 3 rows) */}
          {instantHighlights.length > 0 && (
            <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 text-xs md:text-sm leading-relaxed shadow-[2px_2px_0_#1E1B18]">
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#3E7D4F] text-white">
                ✓ Từ tư liệu
              </span>
              <ul className="space-y-1 text-xs text-[#1E1B18]">
                {instantHighlights.map((row, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#3E7D4F] font-bold">•</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. luuY[0] */}
          {selectedOutfit.luuY && selectedOutfit.luuY.length > 0 && (
            <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 text-xs md:text-sm leading-relaxed shadow-[2px_2px_0_#1E1B18]">
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#3E7D4F] text-white">
                ✓ Từ tư liệu
              </span>
              <p className="text-xs text-[#1E1B18]">
                <span className="font-bold text-[#8E1B1B]">Lưu ý: </span>
                {selectedOutfit.luuY[0]}
              </p>
            </div>
          )}

          {/* Small link: "↻ Gợi ý lại theo bộ phối" */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#5A5148] italic">Gợi ý chung từ tài liệu</span>
            <button
              type="button"
              onClick={handleRegeneratePersonalized}
              disabled={isStreamingStory}
              className="text-xs text-[#2F4A7A] hover:text-[#B8321C] font-bold underline flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>↻ Gợi ý lại theo bộ phối</span>
            </button>
          </div>

          {/* Streamed Gemini lines as chat bubbles */}
          {streamedLines.map((line) => (
            <div
              key={line.id}
              className="bubble-animate bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 text-xs md:text-sm leading-relaxed shadow-[2px_2px_0_#1E1B18]"
            >
              {line.type === 'TU_LIEU' ? (
                <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#3E7D4F] text-white">
                  ✓ Từ tư liệu
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#E9B824] text-[#1E1B18]">
                  ✦ Gemini gợi ý
                </span>
              )}
              <p className="text-[#1E1B18]">{line.text}</p>
            </div>
          ))}

          {/* While waiting: 3 pulsing dots */}
          {isStreamingStory && (
            <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 shadow-[2px_2px_0_#1E1B18] w-fit flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E1B18] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#1E1B18] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#1E1B18] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Error state */}
          {storyError && (
            <div className="space-y-1.5">
              <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 shadow-[2px_2px_0_#1E1B18]">
                <p className="text-xs md:text-sm font-medium text-[#1E1B18]">{storyError.message}</p>
                {!storyError.isQuota && (
                  <button
                    type="button"
                    onClick={() => loadOutfitStory(selectedOutfit.id, false)}
                    className="mt-2 btn-dongho px-3 py-1 bg-[#E9B824] text-[#1E1B18] text-xs font-bold rounded cursor-pointer"
                  >
                    Thử lại
                  </button>
                )}
              </div>
              {storyError.raw && (
                <div className="text-xs font-mono text-[#5A5148] px-1 break-all">
                  (DEBUG) Lỗi: {storyError.raw}
                </div>
              )}
            </div>
          )}

          {/* "Hỏi tiếp nè:" + 3 suggested questions */}
          {!isStreamingStory && (
            <div className="space-y-2 pt-2 border-t border-[#1E1B18]/15">
              <div className="text-xs font-bold text-[#1E1B18]">Hỏi tiếp nè:</div>
              <div className="flex flex-col gap-2">
                {displayQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(q)}
                    disabled={isSubmittingQuestion}
                    className="w-full text-left p-2.5 bg-[#DCE4F0] border-2 border-[#1E1B18] rounded-[10px] text-xs font-medium text-[#1E1B18] hover:bg-[#c9d7ec] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shadow-[2px_2px_0_#1E1B18] disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User questions & responses (up to 6 turns) */}
          {chatList.map((turn) => (
            <div key={turn.id} className="space-y-2 pt-1">
              {/* User question (right-aligned, bg #2F4A7A, white text) */}
              <div className="ml-auto max-w-[85%] bg-[#2F4A7A] text-white p-3 rounded-[14px_4px_14px_14px] text-xs md:text-sm leading-relaxed border-2 border-[#1E1B18] shadow-[2px_2px_0_#1E1B18]">
                <p>{turn.question}</p>
              </div>

              {/* Model answers */}
              {turn.answers.map((ans) => (
                <div
                  key={ans.id}
                  className="bubble-animate bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 text-xs md:text-sm leading-relaxed shadow-[2px_2px_0_#1E1B18]"
                >
                  {ans.type === 'TU_LIEU' ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#3E7D4F] text-white">
                      ✓ Từ tư liệu
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm mb-1.5 bg-[#E9B824] text-[#1E1B18]">
                      ✦ Gemini gợi ý
                    </span>
                  )}
                  <p className="text-[#1E1B18]">{ans.text}</p>
                </div>
              ))}

              {/* Waiting indicator */}
              {turn.isLoading && (
                <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 shadow-[2px_2px_0_#1E1B18] w-fit flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1E1B18] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#1E1B18] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#1E1B18] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {/* Error indicator */}
              {turn.error && (
                <div className="space-y-1">
                  <div className="bg-[#FFFDF7] border-2 border-[#1E1B18] rounded-[4px_14px_14px_14px] p-3 shadow-[2px_2px_0_#1E1B18]">
                    <p className="text-xs font-medium text-[#1E1B18]">{turn.error}</p>
                    {!turn.isQuota && (
                      <button
                        type="button"
                        onClick={() => handleAsk(turn.question)}
                        className="mt-2 btn-dongho px-2.5 py-1 bg-[#E9B824] text-[#1E1B18] text-xs font-bold rounded cursor-pointer"
                      >
                        Thử lại
                      </button>
                    )}
                  </div>
                  {turn.rawError && (
                    <div className="text-xs font-mono text-[#5A5148] px-1 break-all">
                      (DEBUG) {turn.rawError}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pill button: "🌐 Tìm thêm trên web" */}
          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={handleSearchWeb}
              disabled={isSearchingWeb}
              className="btn-dongho px-3 py-1.5 bg-[#2F4A7A] text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isSearchingWeb ? 'Đang tìm trên web…' : '🌐 Tìm thêm trên web'}</span>
            </button>
          </div>

          {/* Web Result Box with dashed border */}
          {webResult && (
            <div className="border-2 border-dashed border-[#1E1B18] bg-[#FFFDF7] p-3 rounded-lg shadow-[2px_2px_0_#1E1B18] space-y-2">
              <div className="text-xs font-bold text-[#B8321C] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Từ web – chưa được đội kiểm chứng</span>
              </div>
              <p className="text-xs text-[#1E1B18] leading-relaxed whitespace-pre-line">{webResult.text}</p>
              {webResult.sources.length > 0 && (
                <div className="pt-2 border-t border-[#1E1B18]/15 space-y-1">
                  <div className="text-xs font-bold text-[#5A5148]">Nguồn từ web:</div>
                  <div className="flex flex-col gap-1">
                    {webResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2F4A7A] hover:underline flex items-center gap-1 font-medium truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{src.title || src.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {webError && (
            <div className="text-xs text-[#8E1B18] bg-red-50 p-2 border border-red-200 rounded">
              {webError}
            </div>
          )}
        </div>

        {/* PINNED INPUT FOOTER at the bottom of the card */}
        <div className="sticky bottom-0 p-3 bg-[#FFFDF7] border-t-2 border-[#1E1B18] space-y-1.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(customQuestion);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Hỏi thêm về bộ này…"
              disabled={isSubmittingQuestion}
              className="flex-1 bg-[#F4EBD9] border-2 border-[#1E1B18] rounded-lg px-3 py-2 text-xs md:text-sm text-[#1E1B18] placeholder:text-[#5A5148] focus:outline-none focus:bg-[#FFFDF7] shadow-inner"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isSubmittingQuestion}
              aria-label="Gửi câu hỏi"
              className="w-9 h-9 bg-[#B8321C] text-white border-2 border-[#1E1B18] rounded-lg shadow-[2px_2px_0_#1E1B18] flex items-center justify-center font-bold text-xs md:text-sm cursor-pointer hover:bg-[#9c2714] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              ➤
            </button>
          </form>

          <div className="text-xs text-center text-[#5A5148] font-medium">
            ✓ tư liệu đội tổng hợp · ✦ Gemini gợi ý
          </div>
        </div>
      </div>

      {/* SUB-TAB 2: 📜 Tư liệu & nguồn */}
      <div
        style={{ display: activeSubTab === 'sources' ? 'block' : 'none' }}
        className="p-4 bg-[#FFFDF7] space-y-4 max-h-[520px] overflow-y-auto"
      >
        {/* Thời kỳ */}
        <div className="text-xs md:text-sm text-[#1E1B18]">
          <span className="font-bold text-[#5A5148]">Thời kỳ: </span>
          <span>{selectedOutfit.thoiKy}</span>
        </div>

        {/* Ý nghĩa */}
        <div className="text-xs md:text-sm text-[#1E1B18] leading-relaxed">
          <span className="font-bold text-[#5A5148]">Ý nghĩa biểu tượng: </span>
          <span>{selectedOutfit.yNghia}</span>
        </div>

        {/* Điểm nhận diện (5 rows, hide "không có dữ liệu") */}
        <div className="p-3 bg-[#F4EBD9] border-2 border-[#1E1B18] rounded-lg space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1B18]">
            Điểm nhận diện cấu trúc:
          </h4>
          <div className="space-y-1.5 text-xs text-[#1E1B18]">
            {hasValidDetail(selectedOutfit.diemNhanDien.coAo) && (
              <div>
                <span className="font-semibold text-[#5A5148]">Cổ áo: </span>
                <span>{selectedOutfit.diemNhanDien.coAo}</span>
              </div>
            )}
            {hasValidDetail(selectedOutfit.diemNhanDien.chieuVat) && (
              <div>
                <span className="font-semibold text-[#5A5148]">Chiều vạt: </span>
                <span>{selectedOutfit.diemNhanDien.chieuVat}</span>
              </div>
            )}
            {hasValidDetail(selectedOutfit.diemNhanDien.cachCai) && (
              <div>
                <span className="font-semibold text-[#5A5148]">Cách cài: </span>
                <span>{selectedOutfit.diemNhanDien.cachCai}</span>
              </div>
            )}
            {hasValidDetail(selectedOutfit.diemNhanDien.tayAo) && (
              <div>
                <span className="font-semibold text-[#5A5148]">Tay áo: </span>
                <span>{selectedOutfit.diemNhanDien.tayAo}</span>
              </div>
            )}
            {hasValidDetail(selectedOutfit.diemNhanDien.doDaiVaLop) && (
              <div>
                <span className="font-semibold text-[#5A5148]">Độ dài & lớp: </span>
                <span>{selectedOutfit.diemNhanDien.doDaiVaLop}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bối cảnh sử dụng */}
        {selectedOutfit.boiCanhSuDung && (
          <div className="text-xs md:text-sm text-[#1E1B18] leading-relaxed">
            <span className="font-bold text-[#5A5148]">Bối cảnh sử dụng: </span>
            <span>{selectedOutfit.boiCanhSuDung}</span>
          </div>
        )}

        {/* Lưu ý */}
        {selectedOutfit.luuY && selectedOutfit.luuY.length > 0 && (
          <div className="p-3 bg-[#FFF5F3] border-2 border-[#1E1B18] rounded-lg space-y-1.5">
            <span className="font-bold text-[#8E1B1B] text-xs block">Lưu ý bảo tồn văn hóa:</span>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#1E1B18]">
              {selectedOutfit.luuY.map((note, idx) => (
                <li key={idx} className="leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nguồn tư liệu (with "Nghiên cứu" / "Báo chí" labels) */}
        <div className="space-y-2 pt-2 border-t border-[#1E1B18]/15">
          <span className="font-bold text-[#5A5148] text-xs block">Nguồn tư liệu đối sánh:</span>
          <div className="flex flex-col gap-2">
            {selectedOutfit.nguon.map((src, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span
                  className={`px-2 py-0.5 text-xs font-bold border shrink-0 ${
                    src.hang === 'A'
                      ? 'bg-[#DCE4F0] text-[#2F4A7A] border-[#2F4A7A]'
                      : 'bg-[#F4EBD9] text-[#5A5148] border-[#5A5148]'
                  }`}
                >
                  {src.hang === 'A' ? 'Nghiên cứu' : 'Báo chí'}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2F4A7A] hover:underline font-medium inline-flex items-center gap-1 leading-snug"
                >
                  <span>{src.ten}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Tham khảo thêm */}
        {selectedOutfit.thamKhaoThem && selectedOutfit.thamKhaoThem.length > 0 && (
          <div className="text-xs text-[#5A5148] pt-2 border-t border-[#1E1B18]/15 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold">Tham khảo thêm:</span>
            {selectedOutfit.thamKhaoThem.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#1E1B18] inline-flex items-center gap-0.5 text-xs text-[#2F4A7A]"
              >
                <span>{url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* SUB-TAB 3: 📷 Ảnh phục dựng (Lazy mounted only when active) */}
      <div
        style={{ display: activeSubTab === 'reconstructed' ? 'block' : 'none' }}
        className="p-4 bg-[#FFFDF7] space-y-4 max-h-[520px] overflow-y-auto"
      >
        {activeSubTab === 'reconstructed' && (
          <OutfitReconstructedGallery
            outfitId={selectedOutfit.id}
            characterGender={character.gender === 'nam' ? 'nam' : 'nu'}
          />
        )}
      </div>
    </div>
  );
};
