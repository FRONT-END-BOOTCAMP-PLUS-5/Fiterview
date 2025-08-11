// API 엔드포인트에서 반환하는 전체 응답 구조
export interface TranscribeQuestionResponse {
  message: string;
  timestamp: string;
  data: {
    reportId: number;
    order: number;
    transcription: {
      text: string;
      language: string;
      model: string;
    };
  };
}
