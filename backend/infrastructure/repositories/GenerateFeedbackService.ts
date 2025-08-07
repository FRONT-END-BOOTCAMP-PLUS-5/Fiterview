import { Feedback } from '@/backend/domain/entities/feedback';
import { IFeedbackRepository } from '@/backend/domain/repositories/IFeedbackRepository';
import { QuestionsRepository } from './QuestionsRepository';
import OpenAI from 'openai';

export interface GenerateFeedbackModel {
  reportId: number;
  report: string;
  strength: string;
  improvement: string;
}

export class GenerateFeedbackService implements IFeedbackRepository {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private reportRepository = new QuestionsRepository();

  private async loadQuestionContent(reportId: number): Promise<string> {
    return await this.reportRepository.getQuestion(reportId);
  }

  private async loadAnswerContent(reportId: number): Promise<string> {
    return await this.reportRepository.getAnswer(reportId);
  }

  public async generateFeedback(reportId: number): Promise<Feedback> {
    const questionContent = await this.loadQuestionContent(reportId);
    const answerContent = await this.loadAnswerContent(reportId);

    const response = await this.client.responses.create({
      model: 'gpt-4o',
      instructions: `You are an artificial intelligence assistant providing feedback on virtual interview answers provided by a candidate. 

Please analyze the candidate's response and provide feedback in the following JSON format ONLY:

{
  "score": 85,
}

The score should be a number between 0-100. Please respond ONLY with valid JSON, no additional text.`,
      input: `Question: ${questionContent}\n\nCandidate Answer: ${answerContent}`,
    });

    let parsedResponse: any;
    try {
      const responseText = response.output_text as string;
      parsedResponse = JSON.parse(responseText);

      // Validate the response structure
      if (
        typeof parsedResponse.score !== 'number' ||
        parsedResponse.score < 0 ||
        parsedResponse.score > 100
      ) {
        throw new Error('Invalid score format or range');
      }
    } catch (error: unknown) {
      console.error('Failed to parse AI response:', response.output_text);
      console.error('Parse error:', error);

      // Fallback: try to extract score from text if JSON parsing fails
      const responseText = response.output_text as string;
      const scoreMatch = responseText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;

      return new Feedback(reportId, fallbackScore);
    }

    return new Feedback(reportId, parsedResponse.score);
  }
}
