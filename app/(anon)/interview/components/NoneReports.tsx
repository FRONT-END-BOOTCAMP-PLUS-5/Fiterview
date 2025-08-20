'use client';

import CalendarX from '@/public/assets/icons/calendarX.svg';

export function NoneReports() {
  return (
    <div className="h-full w-full bg-white rounded-xl outline-1 outline-offset-[-1px] outline-gray-100 inline-flex flex-col justify-center items-center gap-5">
      <div className="w-20 h-20 bg-[#F8FAFC] rounded-[100px] flex justify-center items-center">
        <CalendarX width={40} height={40} strokeWidth={3} stroke="#CBD5E1" />
      </div>
      <div className="flex flex-col justify-start items-center gap-3">
        <p className="text-center justify-start text-slate-800 text-lg font-semibold">
          대기중인 면접이 없습니다.
        </p>
        <p className="text-center justify-start text-slate-500 text-sm">
          포트폴리오를 업로드하고 맞춤형 면접을 생성해보세요.
        </p>
      </div>
    </div>
  );
}
