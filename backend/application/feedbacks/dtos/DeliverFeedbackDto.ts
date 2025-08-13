export interface DeliverFeedbackDto {
  reportId: number;
  score: number;
  strength: string[];
  improvement: string[];
}
