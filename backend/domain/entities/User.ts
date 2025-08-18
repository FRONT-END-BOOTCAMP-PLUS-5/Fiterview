import { Report } from './Report';

export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  nickname: string;
  reports?: Report[];
}
