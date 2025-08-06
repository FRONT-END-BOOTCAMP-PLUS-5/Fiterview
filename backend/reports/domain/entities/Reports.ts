export class Reports {
  constructor(
    public id: number,
    public title: string,
    public createdAt: Date,
    public status: string,
    public userId: number,
    public reflection?: string
  ) {}
}
