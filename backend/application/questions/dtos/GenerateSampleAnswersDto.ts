export interface GenerateSampleAnswersDto {
  reportId: number;
  model: string;
  instructions: string;
  input: string;
  maxOutputTokens?: number;
}
