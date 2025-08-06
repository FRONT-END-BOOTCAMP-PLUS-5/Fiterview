import { IReportsRepository } from '../../domain/repositories/IReportsRepository';
import { Reports } from '../../domain/entities/Reports';
import { prisma } from '@/utils/prisma';

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

  async updateReflection(reportId: number, reflection: string): Promise<Reports> {
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        reflection,
      },
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

  async updateTitle(reportId: number, title: string): Promise<Reports> {
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        title,
      },
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

  async findAllReports(): Promise<Reports[]> {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map(
      (report: Reports) =>
        new Reports(
          report.id,
          report.title,
          report.createdAt,
          report.status,
          report.userId,
          report.reflection || undefined
        )
    );
  }
}
