import type { ReportStatus } from '../../domain/entities/Report';

export const mapReportStatusToDb = (s: ReportStatus): string => s;
export const mapReportStatusToDomain = (s: string): ReportStatus => s as ReportStatus;
