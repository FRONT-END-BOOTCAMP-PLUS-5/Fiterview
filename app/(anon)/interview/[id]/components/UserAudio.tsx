'use client';
import Mic from '@/public/assets/icons/mic.svg';

export default function UserAudio({ text = '음성 인식 중...' }: { text?: string }) {
  return (
    <div
      className={`w-full bg-white rounded-[8px] border border-[#E2E8F0] p-4 flex gap-[8px] items-center`}
    >
      <Mic width={16} height={16} />
      <div className="flex items-center text-[#1E293B] text-[12px] font-medium">{text}</div>
    </div>
  );
}
