import { UserRepository } from '@/backend/domain/repositories/UserRepository';
import { User } from '@/backend/domain/entities/User';
import prisma from '@/utils/prisma';

export class UserRepositoryImpl implements UserRepository {
  async findUserById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user as User | null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    return user as User | null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { username },
    });

    return user as User | null;
  }

  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        username: user.username,
        password: user.password,
        email: user.email,
        nickname: user.nickname,
      },
    });

    return created as User;
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { id: user.id! },
      data: {
        username: user.username,
        password: user.password,
        email: user.email,
        nickname: user.nickname,
      },
    });

    return updated as User;
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
