export interface LoginResponseDto {
  success: boolean; // 로그인 성공 여부
  message: string; // 로그인 결과 메시지
  user?: {
    id: number; //사용자 고유 ID
    username: string;
    email: string;
    nickname: string;
  };
  token?: string;
}
