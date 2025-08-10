export class Question {
  constructor(
    public id: number,
    public order: number,
    public question: string,
    public reportId: number,
    public sampleAnswer?: string,
    public userAnswer?: string,
    public recording?: string
  ) {}
}
