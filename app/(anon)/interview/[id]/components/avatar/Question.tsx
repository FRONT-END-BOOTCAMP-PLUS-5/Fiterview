'use client';
import MessageCircle from '@/public/assets/icons/message-circle.svg';
import ArrowUp from '@/public/assets/icons/arrow-up.svg';
import { useState } from 'react';

interface QuestionProps {
  text: string;
}

export default function Question({ text }: QuestionProps) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="absolute bottom-[52px] w-[calc(100%-104px)] mx-[52px] rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col cursor-default">
      <div className="flex justify-between items-center p-4 ">
        <div className="flex items-center gap-[8px]">
          <MessageCircle width={16} height={16} stroke="#3B82F6" />
          <p className="text-[14px] text-[#3B82F6] font-semibold">질문</p>
        </div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white rounded-[6px] w-[32px] h-[32px] border border-[#E2E8F0] flex items-center justify-center cursor-pointer"
        >
          <span
            className={`will-change-transform transform-gpu origin-center transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
          >
            <ArrowUp width={16} height={16} strokeWidth={1.3} />
          </span>
        </div>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`p-4 bg-white rounded-b-[8px] border-t border-[#E2E8F0] will-change-transform transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
            style={{ transitionDelay: isOpen ? '50ms' : '0ms' }}
          >
            <p className="text-[14px] leading-[22px] text-[#334155] font-medium">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
