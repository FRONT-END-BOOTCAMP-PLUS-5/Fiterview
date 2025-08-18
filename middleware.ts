import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth JWT 토큰 가져오기
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 로그인하지 않은 사용자 처리
  if (!token) {
    // 보호된 경로에 접근하려는 경우 로그인 페이지로 리다이렉트
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 로그인된 사용자는 접근 허용
  return NextResponse.next();
}

// 보호된 경로인지 확인
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/user') || pathname.startsWith('/api/user');
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // 페이지 경로
    '/user/:path*',
    // API 경로
    '/api/user/:path*',
  ],
};
