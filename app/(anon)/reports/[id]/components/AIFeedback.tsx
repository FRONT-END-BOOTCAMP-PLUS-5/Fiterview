'use client';
import React, { useEffect } from 'react';
import Light from '@/public/assets/icons/light.svg';

import { LoadingSpinner } from '@/app/components/loading/LoadingSpinner';
import axios from 'axios';
import { useReportStatusStore } from '@/stores/useReportStatusStore';

export default function AIFeedback({ reportId }: { reportId: number }) {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { currentStatus } = useReportStatusStore();

  const scoreIsNumber = typeof feedback?.score === 'number';
  const progressPercent = feedback?.score ?? 0;
  const hasStrength = Array.isArray(feedback?.strength) && feedback.strength.length > 0;
  const hasImprovement = Array.isArray(feedback?.improvement) && feedback.improvement.length > 0;

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`/api/reports/${reportId}/feedback`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = response.data;

        setFeedback(data);
        setIsCompleted(true);
      } catch (err: any) {
        if (err.response?.status === 409) {
          setIsCompleted(false);
          return;
        } else if (err.response?.status === 404) {
          alert('No existing feedback found');
          setIsCompleted(false);
          return;
        } else {
          alert(
            `Failed to fetch existing feedback: ${err.response?.status} - ${err.response?.data?.error || err.message}`
          );
          setIsCompleted(false);
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    if (reportId && currentStatus !== 'PENDING') {
      fetchFeedback();
    }
  }, [reportId, currentStatus]);

  return (
    <div className="w-full relative rounded-xl bg-white border border-slate-200 box-border flex flex-col items-start justify-start p-6 gap-5 text-left text-lg text-slate-800">
      <div className="self-stretch flex flex-row items-center justify-start gap-2">
        <Light width={20} height={20} strokeWidth={0.2} stroke="#3B82F6" />
        <b className="flex-1 relative leading-[21.6px]">AI 피드백</b>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-4 text-sm text-slate-500">
        <div className="self-stretch flex flex-col items-start justify-start gap-3">
          <div className="self-stretch relative leading-[16.8px] font-semibold">전체 평가</div>
          <div className="self-stretch flex flex-row items-center justify-between gap-0 text-2xl text-slate-800">
            {loading ? (
              <LoadingSpinner />
            ) : isCompleted ? (
              <b className="relative leading-[28.8px]">
                {scoreIsNumber ? `${feedback?.score}점` : '--점'}
              </b>
            ) : (
              <b className="relative leading-[28.8px]">--점</b>
            )}

            <div
              className={`${loading ? 'hidden' : ''} w-30 h-2 bg-slate-200 rounded flex flex-row items-start justify-start`}
            >
              <div
                className={`h-2 bg-blue-500 rounded transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        {isCompleted ? (
          <>
            <div className="self-stretch flex flex-col items-start justify-start gap-3 text-green-600">
              <div className={`self-stretch relative leading-[16.8px] font-bold`}>강점</div>
              <div className="self-stretch flex flex-col items-start justify-start gap-2 text-gray-700">
                {hasStrength ? (
                  feedback.strength.map((strengthItem: string, index: number) => (
                    <div
                      key={index}
                      className="self-stretch flex flex-row items-start justify-start"
                    >
                      <div className="flex-1 flex flex-row items-start justify-start gap-2">
                        <div className="w-1.5 h-1.5 mt-1 bg-emerald-500 rounded-[3px] items-start"></div>
                        <div className="flex-1 relative leading-[16.8px]">{strengthItem}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400"></div>
                )}
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-3 text-red-600">
              <div className={`self-stretch relative leading-[16.8px] font-bold`}>개선점</div>
              <div className="self-stretch flex flex-col items-start justify-start gap-2 text-gray-700">
                {hasImprovement ? (
                  feedback.improvement.map((improvementItem: string, index: number) => (
                    <div
                      key={index}
                      className="self-stretch flex flex-row items-start justify-start"
                    >
                      <div className="flex-1 flex flex-row items-start justify-start gap-2">
                        <div className="w-1.5 h-1.5 mt-1 bg-red-600 rounded-[3px]"></div>
                        <div className="flex-1 relative leading-[16.8px]">{improvementItem}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400"></div>
                )}
              </div>
            </div>
          </>
        ) : null}

        {!isCompleted && !loading && (
          <div className="text-slate-400">면접을 응시하고 AI 피드백을 받아보세요!</div>
        )}
      </div>
    </div>
  );
}
