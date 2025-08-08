export interface IQuestionsRepository {
  getQuestion(reportId: number): Promise<string[]>;
  getAnswer(reportId: number): Promise<string[]>;
}
