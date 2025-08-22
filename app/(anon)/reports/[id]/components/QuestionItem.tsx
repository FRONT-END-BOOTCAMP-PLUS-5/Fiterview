'use client';

import { useState } from 'react';
import ArrowDown from '@/public/assets/icons/arrow-down.svg';
import ArrowUp from '@/public/assets/icons/arrow-up.svg';

interface QuestionItemProps {
  questionNumber: number;
  questionText: string;
  userAnswer?: string;
  sampleAnswer?: string;
  isExpanded?: boolean;
  showActions?: boolean;
  className?: string;
  reportId?: number;
  onQuestionSelect?: () => void;
  onUserAnswerUpdate?: (questionOrder: number, newUserAnswer: string) => void;
}

export default function QuestionItem({
  questionNumber,
  questionText,
  userAnswer,
  sampleAnswer,
  isExpanded = false,
  showActions = false,
  className = '',
  reportId,
  onQuestionSelect,
  onUserAnswerUpdate,
}: QuestionItemProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(userAnswer || '');

  const toggleExpanded = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    // 축소할 때는 모범답안도 숨김
    if (!newExpanded) {
      setShowSampleAnswer(false);
    }
    // 질문 선택 시 AudioPlayer 업데이트
    if (onQuestionSelect) {
      onQuestionSelect();
    }
  };

  const toggleSampleAnswer = () => {
    setShowSampleAnswer(!showSampleAnswer);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedAnswer(userAnswer || '');
    // 수정 모드 진입 시에는 AudioPlayer 업데이트하지 않음
  };

  const handleSave = async () => {
    if (!reportId) return;

    try {
      const response = await fetch(
        `/api/reports/${reportId}/questions/${questionNumber}/user-answer`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userAnswer: editedAnswer }),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        // 부모 컴포넌트에 답변 업데이트 알림
        if (onUserAnswerUpdate) {
          onUserAnswerUpdate(questionNumber, editedAnswer);
        }
      } else {
        console.error('답변 저장 실패');
      }
    } catch (error) {
      console.error('답변 저장 오류:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAnswer(userAnswer || '');
  };

  return (
    <div
      onClick={isEditing ? undefined : toggleExpanded}
      className={`w-full min-h-[56px] p-4 bg-slate-50 ${isEditing ? '' : 'cursor-pointer'} rounded-lg flex flex-col justify-start items-start gap-3 ${className}`}
    >
      {/* 질문 헤더 */}
      <div className="self-stretch flex justify-start items-center gap-4">
        {/* 질문 번호  */}
        <div className="w-7 h-7 bg-blue-50 rounded outline outline-1 outline-offset-[-1px] outline-blue-500 flex justify-center items-center flex-shrink-0">
          <div className="flex justify-center items-center text-blue-500 text-[12px] font-bold w-full h-full">
            Q{questionNumber}
          </div>
        </div>

        {/* 질문 텍스트와 화살표를 포함하는 영역 */}
        <div className="flex-1 flex justify-between items-center gap-2">
          {/* 질문 텍스트 */}
          <div className="justify-start text-slate-800 text-sm font-semibold leading-normal whitespace-pre-line">
            {questionText}
          </div>

          {/* 확장/축소 버튼 */}
          <button
            onClick={isEditing ? undefined : toggleExpanded}
            className={`w-4 h-4 relative origin-top-left overflow-hidden ${isEditing ? 'cursor-default' : 'cursor-pointer'} flex-shrink-0`}
          >
            {expanded ? (
              <ArrowUp width={16} height={16} strokeWidth={1.33} stroke="#303030" />
            ) : (
              <ArrowDown width={16} height={16} strokeWidth={1.33} stroke="#303030" />
            )}
          </button>
        </div>
      </div>

      {/* 답변 내용 */}
      {expanded && (
        <>
          {/* 사용자 답변 */}
          {isEditing ? (
            <div className="self-stretch flex flex-col gap-2">
              <textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={4}
                placeholder="답변을 입력하세요..."
              />
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
            </div>
          ) : (
            <div className="self-stretch justify-start text-gray-700 text-sm font-normal leading-snug">
              {userAnswer || '사용자 답변이 존재하지 않습니다'}
            </div>
          )}

          {/* 모범 답안 */}
          {showSampleAnswer && (
            <div className="self-stretch justify-start text-blue-500 text-sm font-normal leading-snug">
              {sampleAnswer || '모범 답안이 존재하지 않습니다'}
            </div>
          )}

          {/* 액션 버튼들 */}
          {expanded && (
            <div className="self-stretch inline-flex justify-end items-start gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="text-right justify-start text-stone-400 cursor-pointer text-xs font-medium leading-none hover:text-stone-600 transition-colors"
              >
                수정하기
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSampleAnswer();
                }}
                className="justify-start text-xs font-medium cursor-pointer leading-none text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showSampleAnswer ? '모범답안 숨기기' : '모범답안 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
