export interface QuestionDto {
  id: number;
  order: number;
  question: string;
  sampleAnswer?: string;
  userAnswer?: string;
  recording?: string;
}
