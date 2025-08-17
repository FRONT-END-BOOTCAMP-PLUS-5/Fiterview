'use client';

import CalendarX from '@/public/assets/icons/calendarX.svg';

export function NoneReports() {
  return (
    <div className="h-dvh w-full bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-100 inline-flex flex-col justify-center items-center gap-5">
      <div className="w-20 h-20 bg-slate-200 rounded-[40px] inline-flex justify-center items-center">
        <CalendarX width={40} height={40} strokeWidth={3} stroke="#94A3B8" />
      </div>
      <div className="flex flex-col justify-start items-center gap-3">
        <p className="text-center justify-start text-slate-800 text-lg font-semibold font-['Inter'] leading-snug">
          생성된 면접이 없습니다
        </p>
        <p className="text-center justify-start text-slate-500 text-sm font-normal font-['Inter'] leading-tight">
          포트폴리오를 업로드하고 맞춤형 면접을 생성해보세요.
        </p>
      </div>
    </div>
  );
}
