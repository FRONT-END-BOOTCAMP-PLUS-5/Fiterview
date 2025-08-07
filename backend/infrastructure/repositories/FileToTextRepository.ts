// backend/infrastructure/repositories/OpenAIFileToText.ts
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import pdfParse from 'pdf-parse';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { TextExtractor } from '@/backend/domain/repositories/TextExtractor';
import os from 'os';

export class OpenAIFileToText {
  private openai = new OpenAIProvider().getClient();

  /**
   * 1) 파일을 OpenAI에 업로드 (multipart/form-data)
   * 2) 파일 유형에 따라 텍스트 추출 혹은 OCR 호출
   */
  public async extractFromFile(filePath: string): Promise<string> {
    // 1) 먼저 OpenAI 파일 업로드
    const fileId = await this.uploadFile(filePath, 'fine-tune');

    // 2) 확장자에 따라 내부 처리
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      return this.extractTextFromPdf(filePath);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      return this.extractTextFromImage(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * OpenAI File Upload
   * @param filePath 로컬 파일 경로
   * @param purpose  파일 용도 (fine-tune, answers 등)
   * @returns         OpenAI에 등록된 file_id
   */
  public async uploadFile(
    filePath: string,
    purpose: 'fine-tune' | 'assistants' = 'fine-tune'
  ): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stream = fs.createReadStream(filePath);
    const resp = await this.openai.files.create({
      file: stream,
      purpose,
    });

    // resp.id가 업로드된 파일의 식별자입니다.
    return resp.id;
  }

  /** 텍스트 기반 PDF에서 텍스트만 추출 */
  private async extractTextFromPdf(filePath: string): Promise<string> {
    const buffer = await fsPromises.readFile(filePath);
    const { text } = await pdfParse(buffer);

    if (text.trim().length < 20) {
      throw new Error(
        'PDF 내부에 텍스트 레이어가 거의 없습니다. 이미지 기반 PDF는 OCR 처리해야 합니다.'
      );
    }

    return text;
  }

  /** 이미지 파일에서 GPT-4o OCR 텍스트 추출 */
  private async extractTextFromImage(filePath: string): Promise<string> {
    const buffer = await fsPromises.readFile(filePath);
    const mimeType = mime.lookup(filePath);
    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new Error(`Invalid image MIME type: ${mimeType}`);
    }
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const resp = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 이미지에서 텍스트를 추출해줘.' },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0,
    });

    return resp.choices?.[0]?.message?.content?.trim() ?? '';
  }
}

// Adapter class that implements TextExtractor interface
export class FileToTextAdapter implements TextExtractor {
  private openAIFileToText = new OpenAIFileToText();

  async extractFromFile(file: Buffer, fileName: string): Promise<string> {
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, fileName);

    try {
      // Write buffer to temporary file
      await fsPromises.writeFile(tempFilePath, file);

      // Use the existing OpenAIFileToText implementation
      return await this.openAIFileToText.extractFromFile(tempFilePath);
    } finally {
      // Clean up temporary file
      try {
        await fsPromises.unlink(tempFilePath);
      } catch (error) {
        console.warn('Failed to delete temporary file:', error);
      }
    }
  }
}
