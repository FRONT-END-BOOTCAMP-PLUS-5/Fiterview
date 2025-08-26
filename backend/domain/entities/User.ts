import { Report } from '@/backend/domain/entities/Report';

export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  nickname: string;
  reports?: Report[];
}
