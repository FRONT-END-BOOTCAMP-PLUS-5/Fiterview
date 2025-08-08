export class BestAnswersEntity {
  constructor(
    public readonly reportId: number,
    public readonly answers: string[]
  ) {}
}
