// STT 요청 데이터 구조
export interface STTRequest {
  audioFile: Buffer; // 오디오 파일 데이터
  fileName: string; // 파일명
  language?: string; // 언어 (선택사항)
}
