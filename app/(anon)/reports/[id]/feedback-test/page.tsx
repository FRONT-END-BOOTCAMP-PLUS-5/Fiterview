// app/feedback-test/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Feedback {
  reportId: number;
  score: number;
  strength: string;
  improvement: string;
}

export default function FeedbackTestPage() {
  const { id } = useParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/reports/feedback?reportId=${id}`);
      setFeedback(res.data);
    } catch (e: any) {
      setError(e.message);
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>AI Feedback 테스트 (App Router)</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input type="number" value={id} readOnly style={{ width: '4rem', marginRight: '0.5rem' }} />
        <button onClick={fetchFeedback} disabled={loading}>
          {loading ? '로딩 중…' : '피드백 가져오기'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {feedback && (
        <div style={{ border: '1px solid #ddd', padding: '1rem' }}>
          <h2>피드백 결과</h2>
          <p>
            <strong>Score:</strong> {feedback.score}
          </p>
        </div>
      )}
    </main>
  );
}
