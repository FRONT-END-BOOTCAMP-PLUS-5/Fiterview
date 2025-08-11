// app/best-answer-test/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface BestAnswers {
  reportId: number;
  bestAnswers: string[];
}

export default function BestAnswerTestPage() {
  const { id } = useParams();
  const [bestAnswers, setBestAnswers] = useState<BestAnswers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBestAnswers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/reports/best-answers?questions_report_id=${id}`);
      const data = res.data ?? {};
      console.log('Raw API response:', data);
      const normalized: BestAnswers = {
        reportId:
          (data.reportId as number) ?? (data.best_answers_report_id as number) ?? Number(id),
        bestAnswers: Array.isArray(data.bestAnswers)
          ? (data.bestAnswers as string[])
          : Array.isArray(data.best_answers)
            ? (data.best_answers as string[])
            : [],
      };
      console.log('Normalized data:', normalized);
      setBestAnswers(normalized);
    } catch (e: any) {
      setError(e.message);
      setBestAnswers(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>AI Best Answers 테스트 (App Router)</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input type="number" value={id} readOnly style={{ width: '4rem', marginRight: '0.5rem' }} />
        <button onClick={fetchBestAnswers} disabled={loading}>
          {loading ? '로딩 중…' : '최적 답안 가져오기'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {bestAnswers && (
        <div style={{ border: '1px solid #ddd', padding: '1rem' }}>
          <h2>최적 답안 결과</h2>
          {Array.isArray(bestAnswers.bestAnswers) && bestAnswers.bestAnswers.length > 0 ? (
            <div>
              {bestAnswers.bestAnswers.map((answer, index) => {
                console.log(`Answer ${index + 1}:`, answer, 'Type:', typeof answer);
                return (
                  <div
                    key={index}
                    style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f5f5f5' }}
                  >
                    <strong>Answer {index + 1}:</strong>
                    <p>{Array.isArray(answer) ? JSON.stringify(answer) : answer}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>최적 답안이 생성되지 않았습니다.</p>
          )}
        </div>
      )}
    </main>
  );
}
