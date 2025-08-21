'use client';
import React, { useEffect } from 'react';
import BrainIcon from '@/public/assets/icons/brain.svg';
import { LoadingSpinner } from '@/app/(anon)/components/LoadingSpinner';
export default function AIFeedback({ reportId }: { reportId: number }) {
  const [feedback, setFeedback] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const isFeedbackComplete = (feedbackData: any): boolean => {
    return (
      feedbackData &&
      typeof feedbackData.score === 'number' &&
      feedbackData.score >= 0 &&
      feedbackData.score <= 100 &&
      Array.isArray(feedbackData.strength) &&
      feedbackData.strength.length > 0 &&
      Array.isArray(feedbackData.improvement) &&
      feedbackData.improvement.length > 0
    );
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/reports/${reportId}/feedback`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Existing feedback found:', data);

          if (isFeedbackComplete(data)) {
            setFeedback(data);
            setIsCompleted(true);
          }
        } else if (response.status === 409) {
          console.log('Report is not completed');
          setIsCompleted(false);
          return;
        } else if (response.status === 404) {
          console.log('No existing feedback found');
          setIsCompleted(false);
          return;
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch existing feedback:', response.status, errorText);
          throw new Error(`Failed to fetch existing feedback: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error('Error in feedback flow:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchFeedback();
    }
  }, [reportId]);

  return (
    <div className="w-100 relative rounded-xl bg-white border border-slate-200 box-border flex flex-col items-start justify-start p-6 gap-5 text-left text-lg text-slate-800 font-['Inter']">
      <div className="self-stretch flex flex-row items-center justify-start gap-2">
        <BrainIcon className="w-5 h-5 relative overflow-hidden flex-shrink-0 text-[#6366F1]" />
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
                {isFeedbackComplete(feedback) ? `${feedback?.score}점` : '--점'}
              </b>
            ) : (
              <b className="relative leading-[28.8px]">--점</b>
            )}

            <div
              className={`${loading ? 'hidden' : ''} w-30 h-2 bg-slate-200 rounded flex flex-row items-start justify-start`}
            >
              <div
                className={`h-2 bg-blue-500 rounded transition-all duration-300`}
                style={{ width: `${feedback?.score ?? 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        {isCompleted ? (
          <>
            <div className="self-stretch flex flex-col items-start justify-start gap-3 text-green-600">
              <div
                className={`self-stretch relative leading-[16.8px] ${isCompleted ? '' : 'hidden'} font-bold`}
              >
                강점
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-2 text-gray-700">
                {feedback?.strength &&
                Array.isArray(feedback.strength) &&
                feedback.strength.length > 0 ? (
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
              <div
                className={`self-stretch relative leading-[16.8px] ${isCompleted ? '' : 'hidden'} font-bold`}
              >
                개선점
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-2 text-gray-700">
                {feedback?.improvement &&
                Array.isArray(feedback.improvement) &&
                feedback.improvement.length > 0 ? (
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
        {feedback && !isFeedbackComplete(feedback) && (
          <div className="text-orange-600 text-sm mt-2 p-2 bg-orange-50 rounded">
            <strong>주의:</strong> 피드백 데이터가 불완전합니다. 재생성 중...
          </div>
        )}
      </div>
    </div>
  );
}
