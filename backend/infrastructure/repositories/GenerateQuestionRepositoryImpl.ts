import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { GoogleAIProvider } from '@/backend/infrastructure/providers/GoogleAIProvider';
import { DEFAULT_GENERATED_QUESTIONS, QUESTIONS_GENERATION_PROMPT } from '@/constants/questions';
import mime from 'mime-types';

export class GeminiQuestionGenerator {
  private googleAIProvider: GoogleAIProvider;

  constructor() {
    this.googleAIProvider = new GoogleAIProvider();
  }

  async generate(files: QuestionsRequest[]): Promise<QuestionsResponse[]> {
    try {
      return await this.generateQuestionsWithGemini(files);
    } catch (error) {
      throw new Error(
        `질문 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  // 질문 생성
  private async generateQuestionsWithGemini(
    files: QuestionsRequest[]
  ): Promise<QuestionsResponse[]> {
    const prompt = QUESTIONS_GENERATION_PROMPT;

    const genAI = this.googleAIProvider.getClient();

    const fileParts = files.map((file) => {
      const mimeType = this.getMimeType(file.fileName);
      return {
        inlineData: {
          mimeType,
          data: file.buffer.toString('base64'),
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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 응답을 찾을 수 없습니다');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || [];
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
