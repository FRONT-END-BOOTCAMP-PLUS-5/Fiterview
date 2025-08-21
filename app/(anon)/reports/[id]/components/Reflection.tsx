'use client';

import { useState, useEffect } from 'react';
import MessageSquareIcon from '@/public/assets/icons/message-square.svg';
import { LoadingSpinner } from '@/app/(anon)/components/LoadingSpinner';
import useReflection from '@/hooks/useReflection';

export default function Reflection({ reportId }: { reportId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const { reportQuery, saveMutation } = useReflection({ reportId });
  const [text, setText] = useState(
    reportQuery.data?.reflection ?? 'ex) 이번 면접에서 가장 잘한 점'
  );

  useEffect(() => {
    if (!reportQuery.data) return;
    if (text === (reportQuery.data.reflection ?? '')) return;
    const t = setTimeout(() => saveMutation.mutate(text), 600);
    return () => clearTimeout(t);
  }, [text, reportQuery.data, saveMutation]);
  if (reportQuery.isLoading) return <LoadingSpinner />;
  if (reportQuery.isError) return <div>Error</div>;
  if (!reportQuery.data) return <div>No data</div>;

  return (
    <div className="w-146 rounded-xl bg-white border border-slate-200 box-border flex flex-col items-start justify-start p-6 gap-5 text-left text-lg text-slate-800 font-['Inter']">
      <div className="self-stretch flex flex-row items-center justify-start gap-2">
        <MessageSquareIcon className="w-5 h-5 relative overflow-hidden flex-shrink-0" />
        <b className="flex-1 relative leading-[21.6px]">면접 회고</b>
      </div>

      <div className="self-stretch flex flex-col items-start justify-start gap-4 text-sm text-slate-500">
        <div className="self-stretch flex flex-col items-start justify-start gap-3">
          <div className="self-stretch relative leading-[16.8px] font-medium text-slate-700">
            면접에서 느낀 생각과 감정을 솔직하게 기록해보세요.
          </div>

          {isEditing ? (
            <textarea
              className="w-full min-h-48 p-3 bg-slate-50 rounded-md border border-slate-200 outline-none focus:border-slate-300 text-slate-700 placeholder-slate-400"
              placeholder="ex) 이번 면접에서 가장 잘한 점"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <div className="w-full min-h-48 p-3 bg-slate-50 rounded-md border border-slate-200 text-slate-700 whitespace-pre-wrap">
              {text || <span className="text-slate-400">ex) 이번 면접에서 가장 잘한 점</span>}
            </div>
          )}
        </div>

        <button
          type="button"
          className="text-xs font-medium text-slate-400 hover:text-slate-500 transition-colors"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? '저장' : '수정하기'}
        </button>
      </div>
    </div>
  );
}
