export interface Question {
  id: number;
  order: number;
  question: string;
  sampleAnswer?: string;
  userAnswer?: string;
  recording?: string;
  reportId: number;
}
