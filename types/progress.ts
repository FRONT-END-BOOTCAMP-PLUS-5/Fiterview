export type ProgressStep =
  | 'started'
  | 'extracting'
  | 'generating'
  | 'creating_report'
  | 'saving_questions'
  | 'completed'
  | 'error';
