'use client';

import { useEffect, useState } from 'react';
import TopSection from './components/TopSection';
import BottomSection from './components/BottomSection';
import AiAvatar from './components/AiAvatar';
import Question from './components/Question';

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
      <TopSection currentSecond={seconds} totalSeconds={60} />
      <main className="flex-1 flex overflow-hidden">
        {/* Left: 아바타 면접관 영역 */}
        <section className="flex-1 min-w-0 h-full bg-[#F1F5F9] flex flex-col items-center justify-center p-[56px]">
          <AiAvatar />
          <Question text="안녕하세요! 먼저 자기소개를 간단히 해주시겠어요? 본인의 주요 기술 스택과 경험을 중심으로 60초 내외로 말씀해 주세요." />
        </section>
        {/* Right: 사용자 영역 */}
        <section className="flex-1 min-w-0 h-full bg-[#FAFBFC] flex flex-col items-center pt-[48px] px-[40px] gap-[24px]">
          <div className="w-[360px] h-[300px] border border-[#E2E8F0] rounded-[12px] flex items-center justify-center text-[#94A3B8]">
            카메라 연결 실패
          </div>

          <div className="w-[80%] max-w-[720px]">
            <div className="w-full h-[48px] border border-[#E2E8F0] rounded-[10px] flex items-center px-4 text-[#64748B]">
              음성 인식 중...
            </div>
          </div>
        </section>
      </main>
      <BottomSection currentQuestion={1} totalQuestions={10} onNext={() => {}} />
    </div>
  );
}
