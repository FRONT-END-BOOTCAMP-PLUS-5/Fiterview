import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { GeminiAI } from '@/utils/AIs/GeminiAI';
import { DEFAULT_GENERATED_QUESTIONS, QUESTIONS_GENERATION_PROMPT } from '@/constants/questions';
import mime from 'mime-types';
import { perfLogger } from '@/lib/server/perfLogger';

export class QuestionGenerator {
  private GeminiAI: GeminiAI;

  constructor() {
    this.GeminiAI = new GeminiAI();
  }

  async generate(
    files: QuestionsRequest[],
    onPartialBatch?: (batch: QuestionsResponse[]) => void
  ): Promise<QuestionsResponse[]> {
    try {
      const stop = perfLogger.start();
      const questions = await this.generateQuestions(files, onPartialBatch);
      const duration = stop();
      const testInput = files.length === 1 ? files[0].fileName : `${files.length} files`;
      await perfLogger.record({
        changeDesc: '구조화 출력 강제(토큰167->122ver)',
        testInput,
        durationMs: duration,
        category: '질문생성과정',
      });
      return questions.sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error(
        `질문 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // 질문 생성
  private async generateQuestions(
    files: QuestionsRequest[],
    onPartialBatch?: (batch: QuestionsResponse[]) => void
  ): Promise<QuestionsResponse[]> {
    const prompt = QUESTIONS_GENERATION_PROMPT;

    const genAI = this.GeminiAI.getClient();

    const fileParts = files.map((file) => {
      const mimeType = this.getMimeType(file.fileName);
      return {
        inlineData: {
          mimeType,
          data: Buffer.from(file.bytes).toString('base64'),
        },
      };
    });

    const contents = [{ text: prompt }, ...fileParts];

    try {
      type QuestionsPayload = { questions: QuestionsResponse[] };

      const parseQuestionsPayload = (text: string): QuestionsPayload | null => {
        try {
          const parsed = JSON.parse(text) as QuestionsPayload;
          if (!parsed || !Array.isArray(parsed.questions)) return null;
          for (const q of parsed.questions) {
            if (typeof q?.order !== 'number' || typeof q?.question !== 'string') return null;
          }
          return parsed;
        } catch {
          return null;
        }
      };

      const BATCH_SIZE = 5;
      const stream = await genAI.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    order: { type: 'integer' },
                    question: { type: 'string' },
                  },
                  required: ['order', 'question'],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      let accText = '';
      let lastEmittedCount = 0;
      let finalPayload: QuestionsPayload | null = null;

      const tryParseFrom = (text: string): QuestionsPayload | null => {
        const direct = parseQuestionsPayload(text);
        if (direct) return direct;
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
        const candidate = fenced ? fenced[1] : (text.match(/\{[\s\S]*\}/)?.[0] ?? null);
        if (!candidate) return null;
        const sanitized = candidate.replace(/^\uFEFF/, '').replace(/,\s*([}\]])/g, '$1');
        return parseQuestionsPayload(sanitized);
      };

      for await (const chunk of stream) {
        const part = chunk.text ?? '';
        if (!part) continue;
        accText += part;
        const parsed = tryParseFrom(accText);
        if (parsed) {
          finalPayload = parsed;
          const readyLen = parsed.questions.length;
          const toEmitCount = Math.floor(readyLen / BATCH_SIZE) * BATCH_SIZE;
          if (onPartialBatch && toEmitCount > lastEmittedCount) {
            for (let i = lastEmittedCount; i < toEmitCount; i += BATCH_SIZE) {
              onPartialBatch(parsed.questions.slice(i, i + BATCH_SIZE));
            }
            lastEmittedCount = toEmitCount;
          }
        }
      }

      if (!finalPayload) {
        throw new Error('구조화된 질문 페이로드 확인 실패');
      }

      return finalPayload.questions.map(
        (q): QuestionsResponse => ({
          order: q.order,
          question: q.question,
        })
      );
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      // console of accumulated text is skipped to avoid large logs
      return DEFAULT_GENERATED_QUESTIONS;
    }
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      default:
        return mime.lookup(fileName) || 'application/octet-stream';
    }
  }
}
