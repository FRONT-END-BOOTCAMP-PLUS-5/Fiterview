import { IQuestionsRepository } from '@/backend/domain/repositories/IQuestionsRepository';
import prisma from '@/utils/prisma';

export interface QuestionsModel {
  id: number;
  question: string;
}

export interface AnswersModel {
  id: number;
  userAnswer: string;
}

export class QuestionsRepository implements IQuestionsRepository {
  async getQuestion(reportId: number): Promise<string> {
    try {
      const questions: QuestionsModel[] = await prisma.question.findMany({
        where: { reportId: reportId },
        take: 1,
        select: { id: true, question: true },
        orderBy: { id: 'asc' },
      });

      if (questions.length === 0) {
        throw new Error(`No questions found for report ID: ${reportId}`);
      }
      return questions[0].question ?? '';
    } catch (error) {
      throw new Error(`Failed to get question for report ${reportId}: ${error}`);
    }
  }

  async getAnswer(reportId: number): Promise<string> {
    try {
      const answers: AnswersModel[] = await prisma.question.findMany({
        where: { reportId: reportId },
        take: 1,
        select: { id: true, userAnswer: true },
        orderBy: { id: 'asc' },
      });

      if (answers.length === 0) {
        throw new Error(`No answers found for report ID: ${reportId}`);
      }
      return answers[0].userAnswer ?? '';
    } catch (error) {
      throw new Error(`Failed to get answer for report ${reportId}: ${error}`);
    }
  }
}
