export interface QuestionDto {
  id: number;
  order: number;
  question: string;
  sampleAnswer?: string;
  userAnswerRaw?: string;
  userAnswerClean?: string;
  recording?: string;
}
