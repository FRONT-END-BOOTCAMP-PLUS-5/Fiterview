import { ReportStatus } from '@/backend/domain/entities/Report';
//DB status ↔ 도메인 status 매핑
export function mapReportStatusToDb(status: ReportStatus): string {
  switch (status) {
    case 'PENDING':
      return 'PENDING';
    case 'ANALYZING':
      return 'ANALYZING';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return 'PENDING';
  }
}

export function mapReportStatusToDomain(status: string): ReportStatus {
  switch (status) {
    case 'PENDING':
      return 'PENDING';
    case 'ANALYZING':
    case '분석중':
      return 'ANALYZING';
    case 'COMPLETED':
    case '분석완료':
      return 'COMPLETED';
    default:
      return 'PENDING';
  }
}
