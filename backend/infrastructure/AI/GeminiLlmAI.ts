import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { GeminiAI } from '@/utils/AIs/GeminiAI';
import { DEFAULT_GENERATED_QUESTIONS, QUESTIONS_GENERATION_PROMPT } from '@/constants/questions';
import mime from 'mime-types';

export class QuestionGenerator {
  private GeminiAI: GeminiAI;

  constructor() {
    this.GeminiAI = new GeminiAI();
  }

  async generate(files: QuestionsRequest[]): Promise<QuestionsResponse[]> {
    try {
      const questions = await this.generateQuestions(files);
      return questions.sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error(
        `질문 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  // 질문 생성
  private async generateQuestions(files: QuestionsRequest[]): Promise<QuestionsResponse[]> {
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

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('응답 텍스트가 없습니다');
    }

    try {
      // 1) 코드 펜스 ```json ... ``` 내 JSON을 우선 추출
      const fenced = responseText.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const candidate = fenced ? fenced[1] : (responseText.match(/\{[\s\S]*\}/)?.[0] ?? null);
      if (!candidate) {
        throw new Error('JSON 응답을 찾을 수 없습니다');
      }

      // 2) 후행 콤마 제거: 객체/배열 닫힘 앞의 , 제거
      const sanitized = candidate.replace(/^\uFEFF/, '').replace(/,\s*([}\]])/g, '$1');

      const parsed = JSON.parse(sanitized);
      const questions = (parsed.questions || []) as QuestionsResponse[];
      // ai가 order를 주지 않으면 index순 처리
      return questions.map((q, idx) => ({
        order: typeof q.order === 'number' ? q.order : idx + 1,
        question: q.question,
      }));
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', responseText);
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
