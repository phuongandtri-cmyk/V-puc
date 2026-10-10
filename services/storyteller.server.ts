// services/storyteller.server.ts
import { GoogleGenAI } from '@google/genai';
import { getKnowledge } from '../data/knowledge';

export interface StoryContext {
  gioiTinh: string; // 'nam' | 'nu'
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

export const MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'] as const;
export const MODEL_NAME = MODELS[0];

export const SYSTEM_INSTRUCTION = `Bạn là "Người kể chuyện Việt phục" trong app Việt phục Remix, dành cho học sinh, sinh viên Việt Nam.
Chỉ dùng TÀI LIỆU THAM CHIẾU cho các sự thật lịch sử; không thay đổi niên đại, con số, quy chế, chi tiết cấu trúc trong tài liệu.
Gợi ý phối đồ thì được sáng tạo, dựa trên lựa chọn hiện tại của người dùng, nhưng không khẳng định như sự thật lịch sử.
Nếu tài liệu không có thông tin, nói thẳng là chưa có thông tin đã kiểm chứng và gợi ý tìm trên web. Không bịa.
Giọng thân thiện, gần gũi Gen Z nhưng tôn trọng văn hóa; mỗi câu ngắn; không dùng tiếng lóng tiếng Anh.
Chỉ nói về Việt phục và phối đồ.
Định dạng trả lời: mỗi ý một dòng, bắt đầu bằng [TU_LIEU] (sự thật từ tài liệu) hoặc [GOI_Y] (gợi ý phối). Tối đa 6 dòng. Khi được yêu cầu kể chuyện, thêm dòng cuối: CAU_HOI: câu 1 | câu 2 | câu 3`;

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({ apiKey });
}

export interface CacheEntry {
  lines: string[];
  suggestedQuestions: string[];
  timestamp: number;
}

// Server in-memory cache: outfitId|gioiTinh -> CacheEntry, 24h TTL
export const serverStoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function getCachedStory(outfitId: string, gioiTinh: string): CacheEntry | null {
  const key = `${outfitId}|${gioiTinh}`;
  const entry = serverStoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    serverStoryCache.delete(key);
    return null;
  }
  return entry;
}

export function setCachedStory(outfitId: string, gioiTinh: string, lines: string[], questions: string[]): void {
  const key = `${outfitId}|${gioiTinh}`;
  serverStoryCache.set(key, {
    lines,
    suggestedQuestions: questions,
    timestamp: Date.now(),
  });
}

function isRetryableError(err: any): boolean {
  const msg = (err?.message || String(err)).toLowerCase();
  const status = err?.status || err?.statusCode || 0;
  return (
    status === 429 ||
    status === 503 ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('high demand') ||
    msg.includes('unavailable')
  );
}

function isQuotaExhaustedError(err: any): boolean {
  const msg = (err?.message || String(err)).toLowerCase();
  const status = err?.status || err?.statusCode || 0;
  return status === 429 || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
}

/**
 * Debug test function with model fallback
 */
export async function testGeminiServer(): Promise<{ modelName: string; text: string }> {
  const ai = getGeminiClient();

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Trả lời đúng một từ: OK',
      });
      return {
        modelName: model,
        text: response.text?.trim() || 'OK',
      };
    } catch (err: any) {
      console.error(`[Storyteller] testGemini error on model ${model}:`, err);
      if (i < MODELS.length - 1 && isRetryableError(err)) {
        console.log(`[Storyteller] Retrying testGemini with fallback model ${MODELS[i + 1]}...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error('All models failed');
}

/**
 * streamStoryServer with model fallback
 */
export async function* streamStoryServer(
  outfitId: string,
  ctx: StoryContext
): AsyncGenerator<string, void, unknown> {
  const ai = getGeminiClient();
  const knowledge = getKnowledge(outfitId);

  const prompt = `TÀI LIỆU THAM CHIẾU:
${knowledge || 'Không có tài liệu cụ thể cho trang phục này.'}

LỰA CHỌN CỦA NGƯỜI DÙNG:
${JSON.stringify(ctx, null, 2)}

Hãy kể về bộ này và gợi ý phối.`;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      const streamResult = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      for await (const chunk of streamResult) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
      return;
    } catch (err: any) {
      console.error(`[Storyteller] streamStoryServer error on model ${model}:`, err);
      if (i < MODELS.length - 1 && isRetryableError(err)) {
        console.log(`[Storyteller] Retrying streamStoryServer with fallback model ${MODELS[i + 1]}...`);
        continue;
      }
      if (isQuotaExhaustedError(err)) {
        const errorObj = new Error('QUOTA_EXHAUSTED: ' + (err.message || String(err)));
        (errorObj as any).isQuota = true;
        throw errorObj;
      }
      throw err;
    }
  }
}

/**
 * streamAskQuestionServer with model fallback
 */
export async function* streamAskQuestionServer(
  outfitId: string,
  history: ChatTurn[],
  question: string
): AsyncGenerator<string, void, unknown> {
  const ai = getGeminiClient();
  const knowledge = getKnowledge(outfitId);

  const historyLines = (history || [])
    .slice(-4)
    .map((h) => `${h.role === 'user' ? 'Người dùng' : 'Người kể chuyện'}: ${h.text}`)
    .join('\n');

  const prompt = `TÀI LIỆU THAM CHIẾU:
${knowledge || 'Không có tài liệu cụ thể.'}

LỊCH SỬ TRÒ CHUYỆN:
${historyLines || 'Chưa có.'}

CÂU HỎI MỚI: ${question}

Hãy trả lời câu hỏi trên theo định dạng: mỗi ý một dòng bắt đầu bằng [TU_LIEU] hoặc [GOI_Y]. Không tạo dòng CAU_HOI.`;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      const streamResult = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      for await (const chunk of streamResult) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
      return;
    } catch (err: any) {
      console.error(`[Storyteller] streamAskQuestionServer error on model ${model}:`, err);
      if (i < MODELS.length - 1 && isRetryableError(err)) {
        console.log(`[Storyteller] Retrying streamAskQuestionServer with fallback model ${MODELS[i + 1]}...`);
        continue;
      }
      if (isQuotaExhaustedError(err)) {
        const errorObj = new Error('QUOTA_EXHAUSTED: ' + (err.message || String(err)));
        (errorObj as any).isQuota = true;
        throw errorObj;
      }
      throw err;
    }
  }
}

/**
 * searchMoreServer: non-streaming, Google Search tool enabled, NO schema
 */
export async function searchMoreServer(
  outfitId: string,
  question: string
): Promise<SearchMoreResponse> {
  const ai = getGeminiClient();
  const knowledge = getKnowledge(outfitId);

  const prompt = `TÀI LIỆU HIỆN CÓ:
${knowledge || ''}

CÂU HỎI CỦA NGƯỜI DÙNG: "${question}"

Hãy tìm kiếm trên web và tóm tắt trả lời câu hỏi trên bằng tiếng Việt, tối đa 5 câu ngắn gọn.`;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const sources: WebSource[] = [];
      for (const chunk of chunks as any[]) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }

      const uniqueSources = sources.filter(
        (item, index, self) => self.findIndex((s) => s.uri === item.uri) === index
      );

      return {
        text: text.trim(),
        sources: uniqueSources,
      };
    } catch (err: any) {
      console.error(`[Storyteller] searchMoreServer error on model ${model}:`, err);
      if (i < MODELS.length - 1 && isRetryableError(err)) {
        console.log(`[Storyteller] Retrying searchMoreServer with fallback model ${MODELS[i + 1]}...`);
        continue;
      }
      if (isQuotaExhaustedError(err)) {
        return {
          text: '✦ Gemini đã dùng hết lượt miễn phí hôm nay. Bạn có thể tra cứu trực tiếp từ các tài liệu lịch sử uy tín như "Ngàn năm áo mũ" hoặc "Khâm định Đại Nam hội điển sự lệ".',
          sources: [],
        };
      }
      return {
        text: 'Chưa thể tải dữ liệu tìm kiếm web trong lúc này. Bạn có thể tham khảo thêm các sách tư liệu lịch sử uy tín như "Ngàn năm áo mũ" hoặc "Khâm định Đại Nam hội điển sự lệ".',
        sources: [],
      };
    }
  }

  return {
    text: 'Chưa thể tải dữ liệu tìm kiếm web trong lúc này.',
    sources: [],
  };
}
