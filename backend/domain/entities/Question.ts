export interface Question {
  id: number;
  order: number;
  question: string;
  reportId: number;
  sampleAnswer?: string;
  userAnswerRaw?: string;
  userAnswerClean?: string;
  recording?: string;
}

export interface AudioFileInfo {
  filePath: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}
