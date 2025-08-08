// TTS 요청 객체
export interface TTSRequest {
  text: string;
  voice: string;
}
// TTS 응답 객체
export interface TTSResponse {
  audio: Buffer;
}
