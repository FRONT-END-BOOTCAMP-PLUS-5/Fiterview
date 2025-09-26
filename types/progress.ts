export type ProgressStep =
  | 'started'
  | 'extracting'
  | 'generating'
  | 'creating_report'
  | 'saving_questions'
  | 'completed'
  | 'error';

export interface ProgressResponse {
  success: boolean;
  data: {
    step: ProgressStep;
    reportId: number;
    errorMessage: string;
  };
}
