export class GenerateFeedbackDto {
  questions_report_id: number;
  answers_report_id: number;
  model: string;
  instructions: string;
  input: string;
  maxOutputTokens?: number;

  constructor(
    questions_report_id: number,
    answers_report_id: number,
    model: string,
    instructions: string,
    input: string,
    maxOutputTokens?: number
  ) {
    this.questions_report_id = questions_report_id;
    this.answers_report_id = answers_report_id;
    this.model = model;
    this.instructions = instructions;
    this.input = input;
    this.maxOutputTokens = maxOutputTokens;
  }
}
