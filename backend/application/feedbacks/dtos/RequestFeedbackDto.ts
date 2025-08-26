export interface FeedbackPair {
  question: string;
  sampleAnswer?: string | null;
  userAnswer?: string | null;
}

export interface RequestFeedbackDto {
  reportId: number;
  pairs: FeedbackPair[];
  model: string;
  instructions: string;
  maxOutputTokens?: number;
}
