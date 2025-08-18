import { UserRepository } from '@/backend/domain/repositories/UserRepository';
import { SignUpRequestDto } from '@/backend/domain/dtos/SignUpRequestDto';
import { SignUpResponseDto } from '@/backend/domain/dtos/SignUpResponseDto';
import { User } from '@/backend/domain/entities/User';
import bcrypt from 'bcryptjs';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: SignUpRequestDto): Promise<SignUpResponseDto> {
    try {
      // 사용자명 중복 확인
      const existingUserByUsername = await this.userRepository.findUserByUsername(request.username);
      if (existingUserByUsername) {
        return {
          success: false,
          message: '이미 사용 중인 사용자명입니다.',
        };
      }

      // 이메일 중복 확인
      const existingUserByEmail = await this.userRepository.findUserByEmail(request.email);
      if (existingUserByEmail) {
        return {
          success: false,
          message: '이미 사용 중인 이메일입니다.',
        };
      }

      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(request.password, saltRounds);

      // 사용자 생성
      const user = await this.userRepository.create({
        username: request.username,
        email: request.email,
        password: hashedPassword,
        nickname: request.nickname,
      });

      // id가 없는 경우 에러 처리
      if (!user.id) {
        return {
          success: false,
          message: '사용자 생성 중 오류가 발생했습니다.',
        };
      }

      // 성공 응답 반환
      const response: SignUpResponseDto = {
        success: true,
        message: '회원가입이 완료되었습니다.',
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
        message: '회원가입 처리 중 오류가 발생했습니다.',
      };
    }
  }
}
