export interface GenerateSampleAnswersDto {
  questions_report_id: number;
  model: string;
  instructions: string;
  input: string;
  maxOutputTokens?: number;
}
