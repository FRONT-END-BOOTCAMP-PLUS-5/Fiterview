export interface FeedbackPair {
  question: string;
  sampleAnswer?: string | null;
  userAnswer?: string | null;
}

export class RequestFeedbackDto {
  reportId: number;
  pairs: FeedbackPair[];
  model: string;
  instructions: string;
  maxOutputTokens?: number;

  constructor(
    reportId: number,
    pairs: FeedbackPair[],
    model: string,
    instructions: string,
    maxOutputTokens?: number
  ) {
    this.reportId = reportId;
    this.pairs = pairs;
    this.model = model;
    this.instructions = instructions;
    this.maxOutputTokens = maxOutputTokens;
  }
}
