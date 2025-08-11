export class GenerateSampleAnswersDto {
  questions_report_id: number;
  model: string;
  instructions: string;
  input: string;
  maxOutputTokens?: number;

  constructor(
    questions_report_id: number,
    model: string,
    instructions: string,
    input: string,
    maxOutputTokens?: number
  ) {
    this.questions_report_id = questions_report_id;
    this.model = model;
    this.instructions = instructions;
    this.input = input;
    this.maxOutputTokens = maxOutputTokens;
  }
}
