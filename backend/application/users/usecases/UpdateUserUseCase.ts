import { UserRepository } from '@/backend/domain/repositories/UserRepository';
import type { UpdateUserRequestDto } from '@/backend/application/users/dtos/UpdateUserRequestDto';
import { User } from '@/backend/domain/entities/User';
import bcrypt from 'bcryptjs';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: UpdateUserRequestDto) {
    const existing = await this.userRepository.findUserById(request.id);
    if (!existing) {
      return { success: false, message: '사용자를 찾을 수 없습니다.' } as const;
    }

    // 이메일 중복 확인 (본인 제외)
    if (request.email && request.email !== existing.email) {
      const dupEmail = await this.userRepository.findUserByEmail(request.email);
      if (dupEmail && dupEmail.id !== existing.id) {
        return { success: false, message: '이미 사용 중인 이메일입니다.' } as const;
      }
    }

    const updatedUser: User = {
      id: existing.id,
      username: existing.username,
      email: request.email ?? existing.email,
      nickname: request.nickname ?? existing.nickname,
      password: existing.password,
    };

    if (request.password && request.password.length > 0) {
      const saltRounds = 10;
      updatedUser.password = await bcrypt.hash(request.password, saltRounds);
    }

    const saved = await this.userRepository.update(updatedUser);
    return {
      success: true,
      message: '정보가 수정되었습니다.',
      user: {
        id: saved.id!,
        username: saved.username,
        email: saved.email,
        nickname: saved.nickname,
      },
    } as const;
  }
}
