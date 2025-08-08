import { Feedback } from '@/backend/domain/entities/feedback';
import { IQuestionsRepository } from '@/backend/domain/repositories/IQuestionsRepository';
import { QuestionsRepository } from './QuestionsRepository';
import { generateOpenAIResponse } from '@/backend/application/ai/llm/GenerateOpenAIResponse';

export interface GenerateOpenAIResponseOptions {
  model: string;
  instructions?: string;
  maxOutputTokens?: number;
}

export class GenerateOpenAIResponse implements IFeedbackRepository {
  private readonly questionsRepository: IQuestionsRepository;
  private readonly config: Omit<GenerateOpenAIResponseOptions, 'inputOverride'>;

  constructor(
    config: Omit<GenerateOpenAIResponseOptions, 'inputOverride'>,
    questionsRepository?: IQuestionsRepository
  ) {
    if (!config?.model) {
      throw new Error('OpenAI model is required in constructor.');
    }
    this.config = config;
    this.questionsRepository = questionsRepository ?? new QuestionsRepository();
  }

  private async loadQuestionContent(reportId: number): Promise<string> {
    return await this.questionsRepository.getQuestion(reportId);
  }

  private async loadAnswerContent(reportId: number): Promise<string> {
    return await this.questionsRepository.getAnswer(reportId);
  }

  private buildInput(
    questionContent: string,
    answerContent: string,
    inputOverride?: string | unknown
  ): string | unknown {
    if (typeof inputOverride !== 'undefined') {
      return inputOverride;
    }
    return `Question: ${questionContent}\n\nCandidate Answer: ${answerContent}`;
  }

  public async generateFeedbackWithOptions(
    reportId: number,
    options: GenerateOpenAIResponseOptions
  ): Promise<Feedback> {
    const questionContent = await this.loadQuestionContent(reportId);
    const answerContent = await this.loadAnswerContent(reportId);

    const { model, instructions, temperature, maxOutputTokens } = options;
    if (!model) {
      throw new Error('OpenAI model is required.');
    }

    const input = this.buildInput(questionContent, answerContent, options.inputOverride);

    const { outputText } = await generateOpenAIResponse({
      model,
      instructions,
      input,
      maxOutputTokens,
    });

    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(outputText);
      if (
        typeof parsedResponse.score !== 'number' ||
        parsedResponse.score < 0 ||
        parsedResponse.score > 100
      ) {
        throw new Error('Invalid score format or range');
      }
    } catch (error: unknown) {
      console.error('Failed to parse AI response:', outputText);
      console.error('Parse error:', error);

      const scoreMatch = outputText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
      return new Feedback(reportId, fallbackScore);
    }

    return new Feedback(reportId, parsedResponse.score);
  }

  // IFeedbackRepository implementation using constructor-provided config
  public async generateFeedback(reportId: number): Promise<Feedback> {
    const questionContent = await this.loadQuestionContent(reportId);
    const answerContent = await this.loadAnswerContent(reportId);

    const input = this.buildInput(questionContent, answerContent);

    const { outputText } = await generateOpenAIResponse({
      model: this.config.model,
      instructions: this.config.instructions,
      input,
      maxOutputTokens: this.config.maxOutputTokens,
    });

    try {
      const parsed = JSON.parse(outputText);
      if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
        throw new Error('Invalid score format or range');
      }
      return new Feedback(reportId, parsed.score);
    } catch (error: unknown) {
      const scoreMatch = outputText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
      return new Feedback(reportId, fallbackScore);
    }
  }
}
