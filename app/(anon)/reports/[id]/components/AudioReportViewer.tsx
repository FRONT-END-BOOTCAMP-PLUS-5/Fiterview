'use client';

import { useEffect, useState } from 'react';
import QuestionItem from '@/app/(anon)/reports/[id]/components/QuestionItem';
import AudioFileSection from '@/app/(anon)/reports/[id]/components/AudioFileSection';
import { useReportStatusStore } from '@/stores/useReportStatusStore';

interface AudioReportViewerProps {
  reportId: string;
}

export default function AudioReportViewer({ reportId }: AudioReportViewerProps) {
  const [report, setReport] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const { currentStatus, setStatus } = useReportStatusStore();

  // DB에서 리포트와 질문 데이터 가져오기
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`, {
          credentials: 'include', // 쿠키 포함하여 인증 정보 전달
        });

        const result = await response.json();

        if (result.success) {
          setReport(result.data);
          // 리포트 상태를 스토어에 동기화
          setStatus(result.data.status);
          // 첫 번째 질문을 기본 선택으로 설정
          if (result.data.questions && result.data.questions.length > 0) {
            setSelectedQuestion(result.data.questions[0]);
          }
        } else {
          console.error('❌ API 응답 실패:', result.message);
        }
      } catch (error) {
        console.error('💥 API 호출 에러:', error);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  // 질문 선택 핸들러
  const handleQuestionSelect = (question: any) => {
    setSelectedQuestion(question);
  };

  // 사용자 답변 업데이트 핸들러
  const handleUserAnswerUpdate = (questionOrder: number, newUserAnswer: string) => {
    if (report) {
      const updatedQuestions = report.questions.map((question: any) =>
        question.order === questionOrder ? { ...question, userAnswer: newUserAnswer } : question
      );

      setReport({
        ...report,
        questions: updatedQuestions,
      });

      // 선택된 질문도 업데이트
      if (selectedQuestion && selectedQuestion.order === questionOrder) {
        setSelectedQuestion({
          ...selectedQuestion,
          userAnswer: newUserAnswer,
        });
      }
    }
  };

  return (
    <div className=" bg-slate-50 flex flex-col justify-start items-start gap-16">
      {/* 음성 재생 컴포넌트 */}
      <div className="flex flex-col gap-6 w-full">
        {/* 오디오 파일 섹션 */}
        <AudioFileSection
          status={currentStatus}
          selectedQuestion={selectedQuestion}
          reportId={reportId}
        />

        {/* 질문 목록 */}
        <div className="w-full p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col gap-4">
          {/* 질문 목록 렌더링 */}
          {report?.questions?.map((question: any) => (
            <QuestionItem
              key={question.id}
              questionNumber={question.order}
              questionText={question.question}
              userAnswer={question.userAnswer}
              sampleAnswer={question.sampleAnswer}
              isExpanded={false}
              showActions={false}
              className="hover:outline hover:outline-2 hover:outline-offset-[-1px] hover:outline-blue-400"
              reportId={parseInt(reportId)}
              onQuestionSelect={() => handleQuestionSelect(question)}
              onUserAnswerUpdate={handleUserAnswerUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
