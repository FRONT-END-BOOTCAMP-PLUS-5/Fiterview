export interface Question {
  id: number;
  question: string;
  sampleAnswer?: string;
  userAnswer?: string;
  recording?: string;
  reportId: number;
}
