'use client';
import MessageCircle from '@/public/assets/icons/message-circle.svg';

export default function Question({ text }: { text: string }) {
  return (
    <div className="w-full p-4 rounded-[8px] bg-white border border-[#E2E8F0] gap-[8px] flex flex-col">
      <div className="flex items-center gap-[8px]">
        <MessageCircle width={16} height={16} stroke="#3B82F6" />
        <p className="text-[12px] text-[#3B82F6] font-semibold">질문</p>
      </div>
      <p className="text-[14px] leading-[22px] text-[#334155] font-medium">{text}</p>
    </div>
  );
}
