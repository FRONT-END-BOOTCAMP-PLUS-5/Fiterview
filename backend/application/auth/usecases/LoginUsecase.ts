import { LoginRequestDto } from '@/backend/application/users/dtos/LoginRequestDto';
import { LoginResponseDto } from '@/backend/application/users/dtos/LoginResponseDto';
import { UserRepository } from '@/backend/domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import { User } from '@/backend/domain/entities/User';

export class LoginUsecase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      // 사용자명으로 사용자 조회
      const user = await this.userRepository.findUserByUsername(request.username);

      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      // bcryptjs를 사용한 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(request.password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: '비밀번호가 일치하지 않습니다.',
        };
      }

      // id가 없는 경우 에러 처리
      if (!user.id) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 성공 응답 반환
      const response: LoginResponseDto = {
        success: true,
        message: '로그인에 성공했습니다.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
        },
      };

      return response;
    } catch (error) {
      return {
        success: false,
        message: '로그인 처리 중 오류가 발생했습니다.',
      };
    }
  }
}
