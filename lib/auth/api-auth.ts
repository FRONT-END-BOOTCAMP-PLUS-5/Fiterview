import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ISessionUser } from '@/next-auth';

/**
 * 세션에서 사용자 정보를 가져옵니다
 */
export async function getUserFromSession(): Promise<ISessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  // ISessionUser 타입 그대로 반환
  return {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    nickname: session.user.nickname,
  };
}
