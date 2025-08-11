export class DeliverFeedbackDto {
  constructor(
    public feedback_report_id: number,
    public score: string,
    public strength: string,
    public improvement: string
  ) {}
}
