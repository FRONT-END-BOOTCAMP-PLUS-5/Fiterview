export interface QuestionTTSResponse {
  questionId: number;
  question: string;
  order: number | undefined;
  audioBuffer: string;
}
