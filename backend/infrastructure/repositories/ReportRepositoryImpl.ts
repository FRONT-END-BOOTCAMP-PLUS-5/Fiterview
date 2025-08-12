import { Reports, ReportStatus } from '@/backend/domain/entities/Report';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import prisma from '@/utils/prisma';
import { mapReportStatusToDb, mapReportStatusToDomain } from '../mappers/ReportStatusMapper';
import { Prisma, ReportStatus as PrismaReportStatus } from '@prisma/client';

export class ReportRepositoryImpl implements ReportRepository {
  async createReport(userId: number): Promise<Reports> {
    const now = new Date();
    const title = this.generateTitle(now);

    const createdReport = await prisma.report.create({
      data: {
        title,
        userId,
        status: mapReportStatusToDb('PENDING') as any,
        createdAt: now,
      },
    });

    return {
      id: createdReport.id,
      title: createdReport.title,
      createdAt: createdReport.createdAt,
      status: mapReportStatusToDomain(createdReport.status as any),
      userId: createdReport.userId,
      reflection: createdReport.reflection || undefined,
    };
  }

  private generateTitle(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}`;
  }

  async updateReport(reportId: number, updateData: Partial<Reports>): Promise<Reports> {
    const prismaUpdateData: any = {};
    if (updateData.title !== undefined) prismaUpdateData.title = updateData.title;
    if (updateData.reflection !== undefined) prismaUpdateData.reflection = updateData.reflection;
    if (updateData.status !== undefined) {
      prismaUpdateData.status = mapReportStatusToDb(updateData.status as ReportStatus) as any;
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: prismaUpdateData,
    });

    return {
      id: updatedReport.id,
      title: updatedReport.title,
      createdAt: updatedReport.createdAt,
      status: mapReportStatusToDomain(updatedReport.status as any),
      userId: updatedReport.userId,
      reflection: updatedReport.reflection || undefined,
    };
  }

  async findReportById(reportId: number): Promise<Reports | null> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return null;
    }

    return {
      id: report.id,
      title: report.title,
      createdAt: report.createdAt,
      status: mapReportStatusToDomain(report.status as any),
      userId: report.userId,
      reflection: report.reflection || undefined,
    };
  }

  async findAllReports(): Promise<Reports[]> {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map((report) => ({
      id: report.id,
      title: report.title,
      createdAt: report.createdAt,
      status: mapReportStatusToDomain(report.status),
      userId: report.userId,
      reflection: report.reflection ?? undefined,
    }));
  }

  async findReportsByUserId(userId: number, status?: ReportStatus): Promise<Reports[]> {
    const whereClause: Prisma.ReportWhereInput = { userId };

    if (status) {
      whereClause.status = mapReportStatusToDb(status) as PrismaReportStatus;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) => ({
      id: report.id,
      title: report.title,
      createdAt: report.createdAt,
      status: mapReportStatusToDomain(report.status as any),
      userId: report.userId,
      reflection: report.reflection ?? undefined,
    }));
  }

  async deleteReport(reportId: number): Promise<void> {
    await prisma.report.delete({
      where: { id: reportId },
    });
  }
}
