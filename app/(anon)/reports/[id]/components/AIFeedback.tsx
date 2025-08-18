'use client';
import React, { useEffect } from 'react';
import BrainIcon from '@/public/assets/icons/brain.svg';

export default function AIFeedback({ reportId }: { reportId: number }) {
  const [feedback, setFeedback] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Helper function to check if feedback data is complete and valid
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

  // Function to generate new feedback
  const generateNewFeedback = async () => {
    console.log('Generating new feedback...');
    try {
      const generateResponse = await fetch(
        `/api/reports/feedback?questions_report_id=${reportId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (generateResponse.ok) {
        const data = await generateResponse.json();
        console.log('New feedback generated successfully:', data);

        // Check if the new feedback is complete
        if (isFeedbackComplete(data)) {
          setFeedback(data);
        } else {
          console.warn('Generated feedback is incomplete, retrying...');
          // If still incomplete, try one more time
          setTimeout(() => generateNewFeedback(), 1000);
        }
      } else {
        const errorText = await generateResponse.text();
        console.error('Failed to generate feedback:', generateResponse.status, errorText);
        throw new Error(
          `Failed to generate AI feedback: ${generateResponse.status} - ${errorText}`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error generating feedback:', err);
    }
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching existing feedback for report:', reportId);

        // First, try to get existing feedback
        const response = await fetch(`/api/reports/${reportId}/feedback`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Existing feedback found
          const data = await response.json();
          console.log('Existing feedback found:', data);

          // Check if existing feedback is complete
          if (isFeedbackComplete(data)) {
            setFeedback(data);
          } else {
            console.log('Existing feedback is incomplete, generating new feedback...');
            await generateNewFeedback();
          }
        } else if (response.status === 404) {
          // No feedback exists, generate new one
          console.log('No existing feedback found, generating new feedback...');
          await generateNewFeedback();
        } else {
          // Other error occurred
          const errorText = await response.text();
          console.error('Failed to fetch existing feedback:', response.status, errorText);
          throw new Error(`Failed to fetch existing feedback: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
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
        <BrainIcon className="w-5 h-5 relative overflow-hidden flex-shrink-0" />
        <b className="flex-1 relative leading-[21.6px]">AI 피드백</b>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-4 text-sm text-slate-500">
        <div className="self-stretch flex flex-col items-start justify-start gap-3">
          <div className="self-stretch relative leading-[16.8px] font-semibold">전체 평가</div>
          <div className="self-stretch flex flex-row items-center justify-between gap-0 text-2xl text-slate-800">
            {loading ? (
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-slate-800"></div>
            ) : (
              <b className="relative leading-[28.8px]">{feedback?.score ?? '로딩 중...'}</b>
            )}
            <div className="w-30 h-2 bg-slate-200 rounded flex flex-row items-start justify-start">
              <div
                className="h-2 bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${feedback?.score ?? 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start gap-3 text-green-600">
          <div className="self-stretch relative leading-[16.8px] font-bold">강점</div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 text-gray-700">
            {feedback?.strength &&
            Array.isArray(feedback.strength) &&
            feedback.strength.length > 0 ? (
              feedback.strength.map((strengthItem: string, index: number) => (
                <div key={index} className="self-stretch flex flex-row items-start justify-start">
                  <div className="flex-1 flex flex-row items-center justify-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-[3px]"></div>
                    <div className="flex-1 relative leading-[16.8px]">{strengthItem}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400">
                {loading ? '로딩 중...' : '강점 정보가 없습니다'}
              </div>
            )}
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start gap-3 text-red-600">
          <div className="self-stretch relative leading-[16.8px] font-bold">개선점</div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 text-gray-700">
            {feedback?.improvement &&
            Array.isArray(feedback.improvement) &&
            feedback.improvement.length > 0 ? (
              feedback.improvement.map((improvementItem: string, index: number) => (
                <div key={index} className="self-stretch flex flex-row items-start justify-start">
                  <div className="flex-1 flex flex-row items-center justify-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-[3px]"></div>
                    <div className="flex-1 relative leading-[16.8px]">{improvementItem}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400">
                {loading ? '로딩 중...' : '개선점 정보가 없습니다'}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
            <strong>오류:</strong> {error}
          </div>
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
