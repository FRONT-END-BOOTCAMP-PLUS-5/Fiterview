export interface SignUpResponseDto {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    nickname: string;
  };
}
