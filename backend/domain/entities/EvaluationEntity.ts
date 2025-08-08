export class EvaluationEntity {
  constructor(
    public readonly evaluation_report_id: number,
    public readonly score: string
  ) {}
}
