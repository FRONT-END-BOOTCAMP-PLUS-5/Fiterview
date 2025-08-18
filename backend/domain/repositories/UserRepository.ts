import { User } from '../entities/User';

export interface UserRepository {
  // 사용자 조회
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;

  create(user: User): Promise<User>;
  // 사용자 정보 업데이트
  update(user: User): Promise<User>;

  // 사용자 삭제
  delete(id: number): Promise<void>;
}
