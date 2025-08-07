import { TextExtractor } from '@/backend/domain/repositories/TextExtractor';

export interface ExtractTextFromFileDTO {
  file: Buffer;
  fileName: string;
}

export class ExtractTextFromFile {
  constructor(private readonly textExtractor: TextExtractor) {}

  async execute(input: ExtractTextFromFileDTO): Promise<string> {
    // 파일에서 텍스트 추출
    const extractedText = await this.textExtractor.extractFromFile(input.file, input.fileName);

    return extractedText;
  }
}
