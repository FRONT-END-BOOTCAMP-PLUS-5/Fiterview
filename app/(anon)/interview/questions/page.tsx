'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 테스트용 reportId (실제로는 백엔드에서 질문 ID로 조회)
  const testReportId = 7;

  // URL 쿼리 파라미터에서 questionId 가져오기
  const currentQuestionId = searchParams.get('id') || '1';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setError(null);
    } else {
      setError('오디오 파일을 선택해주세요.');
      setAudioFile(null);
    }
  };

  // 질문 변경 시 URL 업데이트
  const handleQuestionChange = (newQuestionId: string) => {
    router.push(`/interview/questions?id=${newQuestionId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('오디오 파일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 오디오 파일을 base64로 변환
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch(
        `/api/reports/${testReportId}/questions/${currentQuestionId}/transcribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Audio,
            language: 'ko',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API 요청 실패');
      }

      const data = await response.json();
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
          <label className="block text-sm font-medium mb-2">질문 번호:</label>
          <input
            type="number"
            value={currentQuestionId}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            min="1"
            max="10"
          />
          <p className="text-sm text-gray-500 mt-1">
            현재 선택된 질문: {currentQuestionId}번 (URL: /interview/questions?id=
            {currentQuestionId})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">음성 파일:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-500 mt-1">지원 형식: m4a, mp3, wav 등</p>
        </div>

        <button
          type="submit"
          disabled={!audioFile || isLoading}
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
              <strong>메시지:</strong> {result.message}
            </p>
            <p>
              <strong>질문 번호:</strong> {currentQuestionId}
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
              <strong>시간:</strong> {result.timestamp}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
