'use client';

import { useEffect, useState } from 'react';
import MessageSquareIcon from '@/public/assets/icons/message-square.svg';
import { LoadingSpinner } from '@/app/components/loading/LoadingSpinner';
import axios from 'axios';

export default function Reflection({
  reportId,
  reflection,
}: {
  reportId: number;
  reflection: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState('');
  const [tempText, setTempText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const dbFetch = async () => {
      const result = await axios.get(`/api/reports/${reportId}`, {
        data: reflection,
      });
      const fetched = result.data.data.reflection ?? '';
      setText(fetched);
      setTempText(fetched);
      setIsLoading(false);
      console.log(result.data.data.reflection);
    };
    dbFetch();
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [reflection]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/reports/${reportId}`, {
        reflection: tempText,
      });
      setText(tempText);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  return (
    <div
      className={`w-[450px] h-[349px] gap-5 rounded-xl bg-white border border-slate-200 box-border flex flex-col items-start justify-start p-6 ${isEditing ? 'pb-4' : 'pb-6'} text-left text-lg text-slate-800`}
    >
      <div className="self-stretch flex flex-row items-center justify-start gap-2 mt-[6px]">
        <MessageSquareIcon className="w-5 h-5 relative overflow-hidden flex-shrink-0 text-[#3B82F6]" />
        <b className="flex-1 relative h-[22px] leading-[21.6px] text-[#1E293B]">면접 회고</b>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div
          className={`self-stretch flex flex-col items-start justify-start ${isEditing ? 'gap-4' : 'gap-5'} text-sm mb-[6px]`}
        >
          <div className="self-stretch flex flex-col items-start justify-start gap-[6px]">
            <div className="self-stretch relative leading-[16.8px] font-medium text-[##374151]">
              면접에서 느낀 생각과 감정을 솔직하게 기록해보세요.
            </div>

            <textarea
              className="w-full h-47 p-3 bg-slate-50 rounded-md border border-slate-200 outline-none focus:border-slate-300 text-slate-700 placeholder-slate-400"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              disabled={!isEditing}
              placeholder="ex) 이번 면접에서 가장 잘한 점"
            />
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
              >
                저장
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-xs font-medium self-end text-slate-400 hover:text-slate-500 transition-colors"
              onClick={() => {
                handleEdit();
              }}
            >
              수정하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
