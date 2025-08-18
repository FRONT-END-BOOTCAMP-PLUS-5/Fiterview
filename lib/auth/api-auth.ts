import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ISessionUser } from '@/next-auth';

export async function getUserFromSession(): Promise<ISessionUser | null> {
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

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
}

export function forbiddenResponse(message: string = '이 리소스에 대한 권한이 없습니다.') {
  return NextResponse.json({ success: false, message }, { status: 403 });
}
