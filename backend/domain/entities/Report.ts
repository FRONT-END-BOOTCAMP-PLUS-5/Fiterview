export type ReportStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED';

export class Reports {
  constructor(
    public id: number,
    public title: string,
    public createdAt: Date,
    public status: ReportStatus,
    public userId: number,
    public reflection?: string
  ) {}
}
