'use client';
import MessageSquare from '@/public/assets/icons/message-square.svg';
import Clock from '@/public/assets/icons/clock.svg';
import RefreshCcw from '@/public/assets/icons/refresh.svg';

export default function NoticeList() {
  return (
    <div className="flex w-full mt-[32px] p-[24px] bg-slate-50 rounded-xl">
      <ul className="space-y-4">
        <li className="flex items-center gap-3">
          <MessageSquare className="w-[20px] h-[20px] text-[#3B82F6]" />
          <span className="font-medium text-slate-700 text-[16px] cursor-default">
            AI 모의면접은 총 10개의 질문으로 구성되어있습니다.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <Clock className="w-[20px] h-[20px] text-[#3B82F6]" />
          <span className="font-medium text-slate-700 text-[16px] cursor-default">
            각 질문의 대답시간은 1분입니다.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <RefreshCcw className="w-[20px] h-[20px] text-[#3B82F6]" />
          <span className="font-medium text-slate-700 text-[16px] cursor-default">
            같은 내용으로 재면접이 불가합니다.
          </span>
        </li>
      </ul>
    </div>
  );
}
