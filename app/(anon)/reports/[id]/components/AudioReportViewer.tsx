'use client';

import { useEffect, useState } from 'react';
import AudioPlayer from '@/app/(anon)/reports/[id]/components/AudioPlayer';
import QuestionItem from '@/app/(anon)/reports/[id]/components/QuestionItem';
import Edit from '@/public/assets/icons/edit.svg';
import X from '@/public/assets/icons/x.svg';
import Check from '@/public/assets/icons/check.svg';

interface AudioReportViewerProps {
  reportId: string;
}

export default function AudioReportViewer({ reportId }: AudioReportViewerProps) {
  const [report, setReport] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  // DB에서 리포트와 질문 데이터 가져오기
  useEffect(() => {
    const fetchReportData = async () => {
      console.log('🔍 API 호출 시작:', `/api/reports/${reportId}`);

      try {
        const response = await fetch(`/api/reports/${reportId}`, {
          credentials: 'include', // 쿠키 포함하여 인증 정보 전달
        });

        console.log('📡 API 응답 상태:', response.status, response.statusText);
        console.log('📡 API 응답 헤더:', Object.fromEntries(response.headers.entries()));

        const result = await response.json();
        console.log('📄 API 응답 데이터:', result);

        if (result.success) {
          setReport(result.data);
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
      console.log('🚀 useEffect 실행, reportId:', reportId);
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

  // 제목 편집 시작 핸들러
  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setEditingTitle(report?.title || '');
  };

  // 제목 저장 핸들러
  const handleSaveTitle = async () => {
    if (!reportId || !editingTitle.trim()) return;

    try {
      // 서버에 제목 업데이트 요청
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // DB 업데이트 성공 시 로컬 상태도 업데이트
          setReport({
            ...report,
            title: result.data.title,
          });
          setIsEditingTitle(false);
          console.log('✅ 제목이 성공적으로 업데이트되었습니다.');
        }
      } else {
        console.error('❌ 제목 업데이트 실패:', response.status);
        // 실패 시 편집 모드 유지
      }
    } catch (error) {
      console.error('💥 제목 업데이트 오류:', error);
      // 에러 시 편집 모드 유지
    }
  };

  // 제목 편집 취소 핸들러
  const handleCancelTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  return (
    <div className="self-stretch h-[1413px] px-16 py-8 bg-slate-50 inline-flex flex-col justify-start items-start gap-16">
      {/* 파일명 헤더 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          {/* 파일명 */}
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="text-center text-slate-800 text-3xl font-bold leading-normal border-2 border-blue-500 focus:outline-none focus:border-blue-600 px-2 rounded"
              placeholder="제목을 입력하세요"
              style={{ width: `${editingTitle.length + 4}ch` }}
            />
          ) : (
            <div className="text-center text-slate-800 text-3xl font-bold leading-normal flex items-center">
              {report?.title || '제목 없음'}
            </div>
          )}

          {/* 편집 섹션 */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <>
                {/* 저장 버튼 */}
                <div className="cursor-pointer" onClick={handleSaveTitle}>
                  <Check width={20} height={20} strokeWidth={0.5} stroke="#303030" />
                </div>
                {/* 취소 버튼 */}
                <div className="cursor-pointer" onClick={handleCancelTitle}>
                  <X width={20} height={20} strokeWidth={2.3} stroke="#303030" />
                </div>
              </>
            ) : (
              /* 수정버튼 */
              <div className="cursor-pointer" onClick={handleEditTitle}>
                <Edit width={20} height={20} strokeWidth={0.5} stroke="#303030" />
              </div>
            )}
          </div>
        </div>
        <div className="self-stretch justify-start text-slate-500 text-base font-normal leading-tight">
          음성 녹음을 기반으로 생성된 면접 스크립트를 통해 개선점을 제안받으세요
        </div>
      </div>

      {/* 음성 재생 컴포넌트 */}
      <div className="flex flex-col gap-6">
        {/* 오디오 플레이어 */}
        <div className="w-[840px] p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="text-slate-800 text-lg font-bold leading-snug">면접 음성 파일</div>
              <div className="h-6 px-2 bg-green-100 rounded-xl flex justify-center items-center">
                <div className="text-green-600 text-xs font-medium leading-none">분석 완료</div>
              </div>
            </div>
            <div className="text-slate-500 text-sm font-normal leading-none">
              질문을 클릭하여 음성파일을 확인해보세요.
            </div>
          </div>

          {/* 음성 - 선택된 질문의 녹음 파일 사용 */}
          {selectedQuestion && (
            <AudioPlayer
              key={`${reportId}-${selectedQuestion.order}`}
              questionNumber={`Q${selectedQuestion.order}`}
              questionText={selectedQuestion.question}
              audioUrl={
                selectedQuestion.recording
                  ? `/assets/audios/${reportId}/${selectedQuestion.recording}`
                  : '/assets/audios/2/recording_2_8.mp3'
              }
              className="self-stretch"
            />
          )}
        </div>

        {/* 질문 목록 */}
        <div className="w-[840px] p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col gap-4">
          {/* 질문 목록 렌더링 (DB에서 가져온 데이터) */}
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
