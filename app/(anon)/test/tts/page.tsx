'use client';

import { useState } from 'react';

type QuestionTTSItem = {
  questionId: number;
  question: string;
  order: number;
  audioBuffer: string; // base64
};

type TTSApiSuccess = {
  success: true;
  data: QuestionTTSItem[];
  reportId: number;
};

type TTSApiError = {
  success: false;
  error: string;
};

export default function TtsTestPage() {
  const [reportId, setReportId] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QuestionTTSItem[]>([]);

  const handleFetchTts = async () => {
    setIsLoading(true);
    setError(null);
    setItems([]);
    try {
      const res = await fetch(`/api/reports/${reportId}/questions/tts`, {
        method: 'GET',
      });
      const json: TTSApiSuccess | TTSApiError = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error((json as TTSApiError).error || `요청 실패: ${res.status}`);
      }
      setItems((json as TTSApiSuccess).data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">질문 TTS 테스트</h1>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-gray-600" htmlFor="reportId">
          Report ID
        </label>
        <input
          id="reportId"
          type="number"
          className="border rounded px-3 py-2 w-32"
          value={reportId}
          onChange={(e) => setReportId(parseInt(e.target.value || '0', 10))}
          min={1}
        />
        <button
          onClick={handleFetchTts}
          disabled={isLoading || reportId < 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : 'TTS 생성'}
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {items.length > 0 && (
        <ul className="space-y-6">
          {items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <li key={item.questionId} className="border rounded p-4">
                <div className="mb-2 text-sm text-gray-500">질문 순서: {item.order}</div>
                <div className="font-semibold mb-3">{item.question}</div>
                <audio
                  controls
                  src={`data:audio/mpeg;base64,${item.audioBuffer}`}
                  className="w-full"
                />
              </li>
            ))}
        </ul>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-gray-500">TTS를 생성하면 이곳에 결과가 표시됩니다.</div>
      )}
    </div>
  );
}
