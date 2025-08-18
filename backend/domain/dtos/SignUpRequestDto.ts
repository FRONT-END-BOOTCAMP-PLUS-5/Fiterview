export interface SignUpRequestDto {
  readonly username: string; // 사용자명 (필수)
  readonly email: string; // 사용자 이메일 (필수)
  readonly password: string; // 사용자 비밀번호 (필수)
  readonly nickname: string; // 닉네임 (필수)
}
