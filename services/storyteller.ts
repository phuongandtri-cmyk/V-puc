// services/storyteller.ts
// Service "Người kể chuyện Việt phục" trong app Việt phục Remix
import { getKnowledge } from '../data/knowledge';

export const MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'] as const;
export const MODEL_NAME = MODELS[0];

export const SYSTEM_INSTRUCTION = `Bạn là "Người kể chuyện Việt phục" trong app Việt phục Remix, dành cho học sinh, sinh viên Việt Nam.
Chỉ dùng TÀI LIỆU THAM CHIẾU cho các sự thật lịch sử; không thay đổi niên đại, con số, quy chế, chi tiết cấu trúc trong tài liệu.
Gợi ý phối đồ thì được sáng tạo, dựa trên lựa chọn hiện tại của người dùng, nhưng không khẳng định như sự thật lịch sử.
Nếu tài liệu không có thông tin, nói thẳng là chưa có thông tin đã kiểm chứng và gợi ý tìm trên web. Không bịa.
Giọng thân thiện, gần gũi Gen Z nhưng tôn trọng văn hóa; mỗi câu ngắn; không dùng tiếng lóng tiếng Anh.
Chỉ nói về Việt phục và phối đồ.
Định dạng trả lời: mỗi ý một dòng, bắt đầu bằng [TU_LIEU] (sự thật từ tài liệu) hoặc [GOI_Y] (gợi ý phối). Tối đa 6 dòng. Khi được yêu cầu kể chuyện, thêm dòng cuối: CAU_HOI: câu 1 | câu 2 | câu 3`;

export interface StoryContext {
  gioiTinh: string; // 'nam' | 'nu' | 'ca-hai'
  suKien?: string | null;
  mau?: string;
  hoaVan?: string;
  phuKien?: string[];
  cultureGuard?: {
    level: string; // 'xanh' | 'vang' | 'do'
    messages: string[];
  };
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface SearchMoreResponse {
  text: string;
  sources: WebSource[];
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface StreamStoryOptions {
  isPersonalized?: boolean;
  sessionId?: string;
}

export { getKnowledge };

// Session counter & listeners
let geminiCallCount = 0;
const callCountListeners = new Set<(count: number) => void>();

export function getGeminiCallCount(): number {
  return geminiCallCount;
}

export function subscribeGeminiCallCount(cb: (count: number) => void): () => void {
  callCountListeners.add(cb);
  cb(geminiCallCount);
  return () => callCountListeners.delete(cb);
}

export function incrementGeminiCallCount(): void {
  geminiCallCount += 1;
  callCountListeners.forEach((cb) => cb(geminiCallCount));
}

// Client browser session ID
let clientSessionId = '';
export function getClientSessionId(): string {
  if (!clientSessionId) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        let sid = sessionStorage.getItem('vietphuc_session_id');
        if (!sid) {
          sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          sessionStorage.setItem('vietphuc_session_id', sid);
        }
        clientSessionId = sid;
      } catch {
        clientSessionId = `sess_${Date.now()}`;
      }
    } else {
      clientSessionId = `sess_${Date.now()}`;
    }
  }
  return clientSessionId;
}

// LocalStorage cache helpers
function getLocalCacheKey(outfitId: string, gioiTinh: string): string {
  return `vietphuc_story_cache_${outfitId}_${gioiTinh}`;
}

export function getLocalCachedStory(outfitId: string, gioiTinh: string): string[] | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(getLocalCacheKey(outfitId, gioiTinh));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('[Storyteller] Failed to read localStorage cache:', err);
  }
  return null;
}

export function setLocalCachedStory(outfitId: string, gioiTinh: string, lines: string[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(getLocalCacheKey(outfitId, gioiTinh), JSON.stringify(lines));
  } catch (err) {
    console.warn('[Storyteller] Failed to write localStorage cache:', err);
  }
}

/**
 * Format a raw line into tagged representation:
 * A line without tag counts as [GOI_Y].
 */
export function formatTaggedLine(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('CAU_HOI:')) return trimmed;
  if (trimmed.startsWith('[TU_LIEU]') || trimmed.startsWith('[GOI_Y]')) {
    return trimmed;
  }
  return `[GOI_Y] ${trimmed}`;
}

/**
 * SSE stream consumer
 */
async function consumeSseStream(
  url: string,
  body: unknown,
  signal: AbortSignal | undefined,
  onLine: (line: string) => void
): Promise<{ rawError?: string; isQuota?: boolean } | void> {
  const sessionId = getClientSessionId();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      const isQuota = (errorData.rawError || errorData.error || '').includes('QUOTA') ||
                      (errorData.rawError || errorData.error || '').includes('429');
      return {
        isQuota,
        rawError: errorData.rawError || errorData.error || 'Hạn mức lượt gọi tạm thời đầy',
      };
    }
    throw new Error(errorData.error || errorData.message || `Lỗi kết nối (${response.status})`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const lines = trimmed.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                return {
                  isQuota: parsed.isQuota,
                  rawError: parsed.rawError || parsed.error,
                };
              }
              if (parsed.line !== undefined) {
                const formatted = formatTaggedLine(parsed.line);
                if (formatted) {
                  onLine(formatted);
                }
              }
            } catch {
              // Ignore non-json chunk
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * streamStory:
 * - Checks localStorage first for general outfit stories (if !isPersonalized).
 * - If cached, emits lines immediately with 0 API calls.
 * - If not cached or isPersonalized, calls Gemini once via server SSE.
 * - Automatically aborts previous stream when a new one starts.
 * - Wraps everything in try/catch, console.error("[Storyteller]", err), never throws to UI.
 */
let currentStoryAbortController: AbortController | null = null;

export async function streamStory(
  outfitId: string,
  ctx: StoryContext,
  onLine: (line: string) => void,
  options?: StreamStoryOptions
): Promise<{ success: boolean; isQuota?: boolean; error?: string }> {
  if (currentStoryAbortController) {
    try {
      currentStoryAbortController.abort();
    } catch {
      // ignore
    }
  }

  currentStoryAbortController = new AbortController();
  const signal = currentStoryAbortController.signal;

  const isPersonalized = !!options?.isPersonalized;
  const gioiTinh = ctx.gioiTinh || 'ca-hai';

  // 1. Client cache check for generic stories
  if (!isPersonalized) {
    const cachedLines = getLocalCachedStory(outfitId, gioiTinh);
    if (cachedLines && cachedLines.length > 0) {
      for (const line of cachedLines) {
        onLine(line);
      }
      return { success: true };
    }
  }

  // Not in local cache, call server
  try {
    incrementGeminiCallCount();

    const collectedLines: string[] = [];
    const result = await consumeSseStream(
      '/api/storyteller/stream-story',
      { outfitId, ctx, isPersonalized },
      signal,
      (line) => {
        collectedLines.push(line);
        onLine(line);
      }
    );

    if (result && (result.isQuota || result.rawError)) {
      return {
        success: false,
        isQuota: result.isQuota,
        error: result.rawError,
      };
    }

    // Cache generic story in localStorage
    if (!isPersonalized && collectedLines.length > 0) {
      setLocalCachedStory(outfitId, gioiTinh, collectedLines);
    }

    return { success: true };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, error: 'Aborted' };
    }
    console.error('[Storyteller] streamStory error:', err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * askQuestion:
 * - Streams answer for user's question.
 * - Automatically aborts previous question stream.
 * - Never throws to UI.
 */
let currentQuestionAbortController: AbortController | null = null;

export async function askQuestion(
  outfitId: string,
  history: ChatTurn[],
  question: string,
  onLine: (line: string) => void
): Promise<{ success: boolean; isQuota?: boolean; error?: string }> {
  if (currentQuestionAbortController) {
    try {
      currentQuestionAbortController.abort();
    } catch {
      // ignore
    }
  }

  currentQuestionAbortController = new AbortController();
  const signal = currentQuestionAbortController.signal;

  try {
    incrementGeminiCallCount();

    const result = await consumeSseStream(
      '/api/storyteller/stream-ask',
      { outfitId, history, question },
      signal,
      onLine
    );

    if (result && (result.isQuota || result.rawError)) {
      return {
        success: false,
        isQuota: result.isQuota,
        error: result.rawError,
      };
    }

    return { success: true };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, error: 'Aborted' };
    }
    console.error('[Storyteller] askQuestion error:', err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * searchMore:
 * - Non-streaming, googleSearch tool, no schema; return { text, sources[{title, uri}] }
 * - Never throws to UI.
 */
export async function searchMore(
  outfitId: string,
  question: string
): Promise<SearchMoreResponse & { error?: string }> {
  try {
    incrementGeminiCallCount();
    const sessionId = getClientSessionId();

    const res = await fetch('/api/storyteller/search-more', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({ outfitId, question }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Lỗi gọi tìm kiếm (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('[Storyteller] searchMore error:', err);
    return {
      text: 'Chưa thể tìm kiếm trên web lúc này. Bạn có thể tham khảo trực tiếp các tài liệu lịch sử uy tín như "Ngàn năm áo mũ" hoặc "Khâm định Đại Nam hội điển sự lệ".',
      sources: [],
      error: err?.message || String(err),
    };
  }
}

/**
 * testGemini for debug button:
 * - Calls server test endpoint with fallback models
 */
export async function testGemini(): Promise<{ success: boolean; modelName: string; text?: string }> {
  try {
    const res = await fetch('/api/storyteller/test-gemini');
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || 'Gemini test failed');
      (err as any).status = res.status;
      throw err;
    }
    return data;
  } catch (err: any) {
    console.error('[Storyteller] testGemini error:', err);
    throw err;
  }
}
