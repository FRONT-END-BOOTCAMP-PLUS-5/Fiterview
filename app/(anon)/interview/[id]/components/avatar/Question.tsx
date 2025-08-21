'use client';
import MessageCircle from '@/public/assets/icons/message-circle.svg';

interface QuestionProps {
  text: string;
}

export default function Question({ text }: QuestionProps) {
  return (
    <div className="absolute bottom-[52px] w-[calc(100%-104px)] mx-[52px] p-4 rounded-[8px] bg-white border border-[#E2E8F0] gap-[8px] flex flex-col">
      <div className="flex items-center gap-[8px]">
        <MessageCircle width={16} height={16} stroke="#3B82F6" />
        <p className="text-[12px] text-[#3B82F6] font-semibold">질문</p>
      </div>
      <p className="text-[14px] leading-[22px] text-[#334155] font-medium">{text}</p>
    </div>
  );
}
