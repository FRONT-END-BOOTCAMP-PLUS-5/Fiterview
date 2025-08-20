import { useSession } from 'next-auth/react';
import type { ISessionUser } from '@/next-auth';

export function useSessionUser() {
  const { data: session, status } = useSession();
  const user = session?.user as ISessionUser;

  return {
    user: user ?? null,
    status,
  };
}
