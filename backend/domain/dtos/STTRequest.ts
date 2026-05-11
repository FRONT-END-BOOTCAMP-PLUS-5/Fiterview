// STT 요청 데이터 구조
export interface STTRequest {
  audioFile: Buffer; // 오디오 파일 데이터
  fileName: string; // 파일명
  language?: string; // 언어 (선택사항)
  prompt?: string; // 도메인 용어 bias 등 모델 가이드 텍스트
}
