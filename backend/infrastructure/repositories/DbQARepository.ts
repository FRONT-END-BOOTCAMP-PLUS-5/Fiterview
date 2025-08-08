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

export class DbQARepository implements IQuestionsRepository {
  async getQuestion(questions_report_id: number): Promise<string[]> {
    try {
      const questions: QuestionsModel[] = await prisma.question.findMany({
        where: { reportId: questions_report_id },
        take: 10,
        select: { id: true, question: true },
        orderBy: { id: 'asc' },
      });

      if (questions.length === 0) {
        throw new Error(`No questions found for report ID: ${questions_report_id}`);
      }
      return questions.map((q) => q.question);
    } catch (error) {
      throw new Error(`Failed to get question for report ${questions_report_id}: ${error}`);
    }
  }

  async getAnswer(answers_report_id: number): Promise<string[]> {
    try {
      const answers: AnswersModel[] = await prisma.question.findMany({
        where: { reportId: answers_report_id },
        take: 10,
        select: { id: true, userAnswer: true },
        orderBy: { id: 'asc' },
      });

      if (answers.length === 0) {
        throw new Error(`No answers found for report ID: ${answers_report_id}`);
      }
      return answers.map((a) => a.userAnswer);
    } catch (error) {
      throw new Error(`Failed to get answer for report ${answers_report_id}: ${error}`);
    }
  }
}
