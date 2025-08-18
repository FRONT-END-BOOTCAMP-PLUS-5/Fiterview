'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!session || !session.user) {
    return null;
  }

  // 타입 단언으로 user 객체의 타입을 명시
  const user = session.user as {
    id: string;
    username?: string | null;
    roles?: string[] | null;
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">사용자 대시보드</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              로그아웃
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">현재 로그인 정보</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">ID:</span>
                <span className="text-gray-900">{user.id}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">사용자명:</span>
                <span className="text-gray-900">{user.username}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">권한:</span>
                <span className="text-gray-900">{user.roles?.join(', ') || 'USER'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 모의면접 시작</h3>
              <p className="text-blue-700 mb-4">
                새로운 모의면접을 시작하고 AI와 함께 연습해보세요.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                면접 시작하기
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">📊 면접 결과 보기</h3>
              <p className="text-blue-700 mb-4">이전 모의면접 결과와 피드백을 확인해보세요.</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                결과 보기
              </button>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">ℹ️ 테스트 정보</h3>
            <p className="text-yellow-700">
              이 페이지는 로그인 테스트를 위한 페이지입니다. 실제 기능은 아직 구현되지 않았습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
