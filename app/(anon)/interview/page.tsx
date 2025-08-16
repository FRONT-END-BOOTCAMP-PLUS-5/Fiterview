'use client';

import { useEffect, useState } from 'react';
import TopSection from './components/TopSection';
import BottomSection from './components/BottomSection';

export default function Page() {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <TopSection seconds={seconds} totalSeconds={60} />
      <main className="flex-1">{/* 콘텐츠 영역 (스크롤 없음) */}</main>
      <BottomSection current={1} total={10} onNext={() => {}} />
    </div>
  );
}
