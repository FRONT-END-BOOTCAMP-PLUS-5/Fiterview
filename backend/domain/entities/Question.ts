export interface Question {
  id: number;
  order: number;
  question: string;
  reportId: number;
  sampleAnswer?: string;
  userAnswer?: string;
  recording?: string;
}

export interface AudioFileInfo {
  filePath: string;
}
