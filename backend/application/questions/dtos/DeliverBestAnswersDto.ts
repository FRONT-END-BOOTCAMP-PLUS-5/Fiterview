export class DeliverBestAnswersDto {
  constructor(
    public best_answers_report_id: string,
    public best_answers: string[]
  ) {}
}
