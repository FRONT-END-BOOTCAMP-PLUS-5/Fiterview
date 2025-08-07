import { Reports } from '@/backend/domain/entities/Report';
import { IReportsRepository } from '@/backend/domain/repositories/IReportsRepository';
import prisma from '@/utils/prisma';

export class PrReportsRepository implements IReportsRepository {
  async createReport(userId: number): Promise<Reports> {
    const now = new Date();
    const title = this.generateTitle(now);

    const createdReport = await prisma.report.create({
      data: {
        title,
        userId,
        status: '1',
        createdAt: now,
      },
    });

    return new Reports(
      createdReport.id,
      createdReport.title,
      createdReport.createdAt,
      createdReport.status,
      createdReport.userId,
      createdReport.reflection || undefined
    );
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
    if (updateData.status !== undefined) prismaUpdateData.status = updateData.status;

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: prismaUpdateData,
    });

    return new Reports(
      updatedReport.id,
      updatedReport.title,
      updatedReport.createdAt,
      updatedReport.status,
      updatedReport.userId,
      updatedReport.reflection || undefined
    );
  }

  async findReportById(reportId: number): Promise<Reports | null> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return null;
    }

    return new Reports(
      report.id,
      report.title,
      report.createdAt,
      report.status,
      report.userId,
      report.reflection || undefined
    );
  }

  async findAllReports(): Promise<Reports[]> {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map(
      (report) =>
        new Reports(
          report.id,
          report.title,
          report.createdAt,
          report.status,
          report.userId,
          report.reflection ?? undefined
        )
    );
  }
}
