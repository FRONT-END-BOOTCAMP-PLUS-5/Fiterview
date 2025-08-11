export class Feedback {
  constructor(
    public readonly feedback_report_id: number,
    public readonly score: string,
    public readonly strength: string,
    public readonly improvement: string
  ) {}
}
