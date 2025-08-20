import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ISessionUser } from '@/next-auth';

export async function getUserFromSession(): Promise<ISessionUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = session.user;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
  };
}
