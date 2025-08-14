'use client';

import React, { useState } from 'react';

export default function TestCreateReportPage() {
  const [userId, setUserId] = useState<string>('1');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!files || files.length === 0) {
      setError('파일을 선택해주세요.');
      return;
    }
    if (!userId || Number.isNaN(parseInt(userId, 10))) {
      setError('유효한 userId를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('userId', userId);
      Array.from(files).forEach((file) => formData.append('files', file));

      const res = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || json?.success === false) {
        setError(json?.message || '요청 중 오류가 발생했습니다.');
      } else {
        setResult(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>리포트 생성 테스트</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>userId</span>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="예: 1"
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>파일 업로드 (PDF, PNG, JPG, WEBP)</span>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </label>

        {files && files.length > 0 && (
          <div style={{ fontSize: 12, color: '#555' }}>
            선택된 파일 {files.length}개:
            <ul>
              {Array.from(files).map((f) => (
                <li key={f.name}>
                  {f.name} ({Math.round(f.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: isSubmitting ? '#eee' : '#f5f5f5',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? '생성 중...' : '리포트 생성 요청'}
        </button>
      </form>

      {error && <div style={{ marginTop: 16, color: '#b00020' }}>에러: {error}</div>}

      {result && (
        <pre
          style={{
            marginTop: 16,
            padding: 12,
            background: '#fafafa',
            border: '1px solid #eee',
            borderRadius: 8,
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
