export class DeliverFeedbackDto {
  reportId: number;
  score: number;

  constructor(reportId: number, score: number) {
    this.reportId = reportId;
    this.score = score;
  }
}
