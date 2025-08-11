export class BestAnswersEntity {
  constructor(
    public readonly best_answers_report_id: number,
    public readonly best_answers: string[]
  ) {}
}
