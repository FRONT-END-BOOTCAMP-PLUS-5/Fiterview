import getOpenAIClient from '@/utils/AI/OpenAI';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswerDto';

export class GPTSampleAnswerRepositoryImpl {
  constructor(gptSettings: GenerateSampleAnswersDto) {
    if (!gptSettings?.model) {
      throw new Error('OpenAI model is required in constructor.');
    }
  }

  private createInputToGpt(questionContentArray: string[]) {
    let input = '';
    for (let i = 0; i < questionContentArray.length; i++) {
      input += `Question: ${questionContentArray[i]}\n\n`;
    }
    return input;
  }

  public async generateSampleAnswer(
    generateSampleAnswersDto: GenerateSampleAnswersDto
  ): Promise<string> {
    const questionContentArray = generateSampleAnswersDto.input
      .split('\n')
      .filter((s) => s.trim().length > 0);

    const input = this.createInputToGpt(questionContentArray);

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: generateSampleAnswersDto.model,
      instructions: generateSampleAnswersDto.instructions,
      input,
      max_output_tokens: generateSampleAnswersDto.maxOutputTokens,
    } as any);

    const outputText = (response as any).output_text as string;

    try {
      // Try to parse as JSON first (in case AI returns proper JSON array)
      let parsedAnswers: string[];
      try {
        const jsonMatch = outputText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedAnswers = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to splitting by newlines if no JSON array found
          parsedAnswers = outputText.split('\n').filter((line) => line.trim().length > 0);
        }
      } catch (parseError) {
        // If JSON parsing fails, fallback to splitting by newlines
        parsedAnswers = outputText.split('\n').filter((line) => line.trim().length > 0);
      }

      return parsedAnswers.join('\n');
    } catch (error) {
      return '';
    }
  }
}
