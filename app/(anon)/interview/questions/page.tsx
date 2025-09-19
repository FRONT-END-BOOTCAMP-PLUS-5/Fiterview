'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/axiosInstance';

function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // URL 쿼리 파라미터에서 값 가져오기
  const [testReportId, setTestReportId] = useState(searchParams.get('reportId') || '7');
  const [currentQuestionId, setCurrentQuestionId] = useState(searchParams.get('order') || '1');

  // URL 파라미터 변경 시 state 동기화
  useEffect(() => {
    const reportId = searchParams.get('reportId');
    const order = searchParams.get('order');

    if (reportId && reportId !== testReportId) {
      setTestReportId(reportId);
    }
    if (order && order !== currentQuestionId) {
      setCurrentQuestionId(order);
    }
  }, [searchParams, testReportId, currentQuestionId]);

  // Report ID 변경 시 URL 업데이트
  const handleReportIdChange = (newReportId: string) => {
    setTestReportId(newReportId);
    const newUrl = `/interview/questions?reportId=${newReportId}&order=${currentQuestionId}`;
    router.push(newUrl);
  };

  // 질문 변경 시 URL 업데이트
  const handleQuestionChange = (newQuestionId: string) => {
    setCurrentQuestionId(newQuestionId);
    const newUrl = `/interview/questions?reportId=${testReportId}&order=${newQuestionId}`;
    router.push(newUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post(
        `/api/reports/${testReportId}/questions/${currentQuestionId}/transcribe`
      );

      const data = response.data;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">질문 답변 음성-텍스트 변환</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Report ID:</label>
          <input
            type="number"
            value={testReportId}
            onChange={(e) => handleReportIdChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            min="1"
            placeholder="Report ID를 입력하세요"
          />
          <p className="text-sm text-gray-500 mt-1">현재 선택된 Report ID: {testReportId}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">질문 번호:</label>
          <input
            type="number"
            value={currentQuestionId}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            min="1"
            max="10"
            placeholder="질문 번호를 입력하세요 (1-10)"
          />
          <p className="text-sm text-gray-500 mt-1">현재 선택된 질문: {currentQuestionId}번</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            📁 <strong>음성 파일 정보:</strong>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            • Report ID: {testReportId}의 {currentQuestionId}번 질문
          </p>
          <p className="text-sm text-blue-600">• DB에서 녹음된 음성 파일을 자동으로 조회합니다</p>
          <p className="text-sm text-blue-600">
            • 파일 경로: assets/audios/{testReportId}/{currentQuestionId}.mp3
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '처리 중...' : '음성-텍스트 변환 시작'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold mb-2">변환 결과:</h3>
          <div className="space-y-2">
            <p>
              <strong>메시지:</strong> {result.data.message}
            </p>
            <p>
              <strong>Report ID:</strong> {result.data.reportId}
            </p>
            <p>
              <strong>질문 번호:</strong> {result.data.order}번
            </p>
            <p>
              <strong>변환된 텍스트:</strong> {result.data.transcription.text}
            </p>
            <p>
              <strong>언어:</strong> {result.data.transcription.language}
            </p>
            <p>
              <strong>모델:</strong> {result.data.transcription.model}
            </p>
            <p>
              <strong>시간:</strong> {result.data.timestamp}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2 text-blue-800">현재 URL:</h3>
        <p className="text-sm text-blue-600 font-mono">
          /interview/questions?reportId={testReportId}&order={currentQuestionId}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          URL이 자동으로 업데이트됩니다. 북마크하거나 공유할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <QuestionsPageContent />
    </Suspense>
  );
}
