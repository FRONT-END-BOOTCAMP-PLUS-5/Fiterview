'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push('/test-extract-text');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">리다이렉트 중...</h1>
        <p className="text-gray-600">텍스트 추출 테스트 페이지로 이동합니다.</p>
      </div>
    </div>
  );
}
