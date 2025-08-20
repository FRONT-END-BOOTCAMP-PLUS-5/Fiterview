import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ISessionUser } from '@/next-auth';

export async function getUserFromSession(): Promise<ISessionUser | null> {
  // Dev-only bypass via env
  if (process.env.NODE_ENV !== 'production' && process.env.AUTH_BYPASS_USER_ID) {
    return {
      id: String(process.env.AUTH_BYPASS_USER_ID),
      username: 'dev',
      email: 'dev@example.com',
      nickname: process.env.AUTH_BYPASS_NICKNAME ?? 'Dev',
    };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    nickname: session.user.nickname,
  };
}
