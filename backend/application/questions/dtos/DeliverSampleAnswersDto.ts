export class DeliverSampleAnswersDto {
  constructor(
    public sample_answers_report_id: number,
    public sample_answers: string[]
  ) {}
}
