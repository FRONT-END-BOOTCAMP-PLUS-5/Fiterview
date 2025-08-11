export class DeliverBestAnswersDto {
  constructor(
    public best_answers_report_id: number,
    public best_answers: string[]
  ) {}
}
