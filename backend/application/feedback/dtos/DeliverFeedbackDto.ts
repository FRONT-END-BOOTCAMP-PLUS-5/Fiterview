export class DeliverFeedbackDto {
  constructor(
    public feedback_report_id: number,
    public score: number,
    public strength: string,
    public improvement: string
  ) {}
}
