'use client';

import { useEffect, useState } from 'react';
import MessageSquareIcon from '@/public/assets/icons/message-square.svg';
import { LoadingSpinner } from '@/app/(anon)/components/LoadingSpinner';
import axios from 'axios';

export default function Reflection({
  reportId,
  reflection,
}: {
  reportId: number;
  reflection: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState(reflection ?? 'ex) 이번 면접에서 가장 잘한 점');

  useEffect(() => {
    setIsLoading(false);
  }, [reflection]);

  const handleSaveClick = async () => {
    try {
      await axios.put(`/api/reports/${reportId}`, {
        reflection: text,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="w-[450px] rounded-xl bg-white border border-slate-200 box-border flex flex-col items-start justify-start p-6 gap-5 text-left text-lg text-slate-800">
      <div className="self-stretch flex flex-row items-center justify-start gap-2">
        <MessageSquareIcon className="w-5 h-5 relative overflow-hidden flex-shrink-0 text-[#6366F1]" />
        <b className="flex-1 relative leading-[21.6px] text-[#1E293B]">면접 회고</b>
      </div>

      <div className="self-stretch flex flex-col items-start justify-start gap-5 text-sm">
        <div className="self-stretch flex flex-col items-start justify-start gap-[6px]">
          <div className="self-stretch relative leading-[16.8px] font-medium text-[#3B82F6]">
            면접에서 느낀 생각과 감정을 솔직하게 기록해보세요.
          </div>

          <textarea
            className="w-full min-h-48 p-3 bg-slate-50 rounded-md border border-slate-200 outline-none focus:border-slate-300 text-slate-700 placeholder-slate-400"
            placeholder="ex) 이번 면접에서 가장 잘한 점"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="text-xs font-medium self-end text-slate-400 hover:text-slate-500 transition-colors"
          onClick={() => {
            handleSaveClick();
          }}
        >
          수정하기
        </button>
      </div>
    </div>
  );
}
