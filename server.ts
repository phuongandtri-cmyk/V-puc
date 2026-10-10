// server.ts
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  streamStoryServer,
  streamAskQuestionServer,
  searchMoreServer,
  testGeminiServer,
  getCachedStory,
  setCachedStory,
  MODELS,
  MODEL_NAME,
} from './services/storyteller.server';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session lock: allow at most 1 active request per browser session
const activeSessions = new Set<string>();

function getSessionId(req: express.Request): string {
  const headerId = req.headers['x-session-id'] as string;
  if (headerId) return headerId;
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  return `${ip}`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route: Debug / Test Gemini endpoint
  app.get('/api/storyteller/test-gemini', async (_req, res) => {
    try {
      const data = await testGeminiServer();
      res.json({ success: true, text: data.text, modelName: data.modelName });
    } catch (err: any) {
      console.error('[GeminiTest]', err);
      const status = err?.status || err?.statusCode || 500;
      const message = err?.message || String(err);
      res.status(500).json({
        success: false,
        modelName: MODEL_NAME,
        error: `${status} - ${message}`,
      });
    }
  });

  // API Route: SSE Stream Story
  app.post('/api/storyteller/stream-story', async (req, res) => {
    const { outfitId, ctx, isPersonalized } = req.body;
    if (!outfitId) {
      return res.status(400).json({ error: 'outfitId is required' });
    }

    const sessionId = getSessionId(req);
    if (activeSessions.has(sessionId)) {
      return res.status(429).json({
        error: 'REQUEST_IN_PROGRESS',
        message: 'Đang xử lý một yêu cầu khác, vui lòng đợi trong giây lát.',
      });
    }
    activeSessions.add(sessionId);

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const cleanup = () => {
      activeSessions.delete(sessionId);
    };
    req.on('close', cleanup);

    const gioiTinh = ctx?.gioiTinh || 'ca-hai';

    // 1. Server cache check (only if not explicit personalized remix request)
    if (!isPersonalized) {
      const cached = getCachedStory(outfitId, gioiTinh);
      if (cached) {
        for (const line of cached.lines) {
          res.write(`data: ${JSON.stringify({ line })}\n\n`);
        }
        if (cached.suggestedQuestions && cached.suggestedQuestions.length > 0) {
          const qLine = `CAU_HOI: ${cached.suggestedQuestions.join(' | ')}`;
          res.write(`data: ${JSON.stringify({ line: qLine })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        cleanup();
        res.end();
        return;
      }
    }

    let lineBuffer = '';
    const collectedLines: string[] = [];
    let collectedQuestions: string[] = [];

    try {
      // General story only uses ctx = { gioiTinh } for shared caching unless personalized
      const promptCtx = isPersonalized ? (ctx || {}) : { gioiTinh };
      const stream = streamStoryServer(outfitId, promptCtx);

      for await (const chunk of stream) {
        lineBuffer += chunk;
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            if (trimmed.startsWith('CAU_HOI:')) {
              const questionsPart = trimmed.replace('CAU_HOI:', '').trim();
              collectedQuestions = questionsPart
                .split('|')
                .map((q) => q.trim())
                .filter(Boolean)
                .slice(0, 3);
            } else {
              collectedLines.push(trimmed);
            }
            res.write(`data: ${JSON.stringify({ line: trimmed })}\n\n`);
          }
        }
      }

      // Flush remaining line buffer if any
      const trimmedRemaining = lineBuffer.trim();
      if (trimmedRemaining) {
        if (trimmedRemaining.startsWith('CAU_HOI:')) {
          const questionsPart = trimmedRemaining.replace('CAU_HOI:', '').trim();
          collectedQuestions = questionsPart
            .split('|')
            .map((q) => q.trim())
            .filter(Boolean)
            .slice(0, 3);
        } else {
          collectedLines.push(trimmedRemaining);
        }
        res.write(`data: ${JSON.stringify({ line: trimmedRemaining })}\n\n`);
      }

      // Cache general stories (24h TTL)
      if (!isPersonalized && collectedLines.length > 0) {
        setCachedStory(outfitId, gioiTinh, collectedLines, collectedQuestions);
      }

      res.write('data: [DONE]\n\n');
      cleanup();
      res.end();
    } catch (err: any) {
      console.error('[Storyteller] Server stream-story error:', err);
      const isQuota = (err as any)?.isQuota || (err?.message || '').includes('QUOTA_EXHAUSTED');
      res.write(
        `data: ${JSON.stringify({
          error: isQuota
            ? 'QUOTA_EXHAUSTED'
            : err?.message || 'Lỗi xử lý câu chuyện',
          rawError: err?.message || String(err),
          isQuota,
        })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      cleanup();
      res.end();
    }
  });

  // API Route: SSE Stream Ask Question
  app.post('/api/storyteller/stream-ask', async (req, res) => {
    const { outfitId, history, question } = req.body;
    if (!outfitId || !question) {
      return res.status(400).json({ error: 'outfitId and question are required' });
    }

    const sessionId = getSessionId(req);
    if (activeSessions.has(sessionId)) {
      return res.status(429).json({
        error: 'REQUEST_IN_PROGRESS',
        message: 'Đang xử lý một yêu cầu khác, vui lòng đợi trong giây lát.',
      });
    }
    activeSessions.add(sessionId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const cleanup = () => {
      activeSessions.delete(sessionId);
    };
    req.on('close', cleanup);

    let lineBuffer = '';

    try {
      const stream = streamAskQuestionServer(outfitId, history || [], question);
      for await (const chunk of stream) {
        lineBuffer += chunk;
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            res.write(`data: ${JSON.stringify({ line: trimmed })}\n\n`);
          }
        }
      }

      const trimmedRemaining = lineBuffer.trim();
      if (trimmedRemaining) {
        res.write(`data: ${JSON.stringify({ line: trimmedRemaining })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      cleanup();
      res.end();
    } catch (err: any) {
      console.error('[Storyteller] Server stream-ask error:', err);
      const isQuota = (err as any)?.isQuota || (err?.message || '').includes('QUOTA_EXHAUSTED');
      res.write(
        `data: ${JSON.stringify({
          error: isQuota
            ? 'QUOTA_EXHAUSTED'
            : err?.message || 'Lỗi xử lý câu hỏi',
          rawError: err?.message || String(err),
          isQuota,
        })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      cleanup();
      res.end();
    }
  });

  // API Route: Search More with Google Search
  app.post('/api/storyteller/search-more', async (req, res) => {
    const { outfitId, question } = req.body;
    if (!outfitId || !question) {
      return res.status(400).json({ error: 'outfitId and question are required' });
    }

    const sessionId = getSessionId(req);
    if (activeSessions.has(sessionId)) {
      return res.status(429).json({
        error: 'REQUEST_IN_PROGRESS',
        message: 'Đang xử lý một yêu cầu khác, vui lòng đợi trong giây lát.',
      });
    }
    activeSessions.add(sessionId);

    try {
      const result = await searchMoreServer(outfitId, question);
      activeSessions.delete(sessionId);
      res.json(result);
    } catch (err: any) {
      activeSessions.delete(sessionId);
      console.error('[Storyteller] searchMore error:', err);
      res.status(500).json({
        error: 'Chưa thể tìm kiếm trên web lúc này.',
        rawError: err?.message || String(err),
      });
    }
  });

  // Vite middlewares in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
