'use client';

import { useState } from 'react';

export default function Page() {
  const [questions] = useState([
    '안녕하세요? 저희 회사에 지원하게 되신 이유가 무엇인가요?',
    '가장 도전적이었던 프로젝트는 무엇인가요? 기술적으로 어떤 부분이 어려웠고 어떻게 해결했나요?',
    'Promise 에 대해 설명해주세요.',
    '핏터뷰 프로젝트에서 맡은 역할은 무엇인가요?',
    'ai 모델은 어떤 기준으로 선정하셨나요?',
    '타입스크립트를 사용하는 이유는 뭐라고 생각하시나요?',
    'yarn berry를 사용한 이유는 무엇이었나요?',
    'Type Alias와 Interface의 차이는 무엇인가요?',
    '리액트 컴포넌트가 리렌더링되는 조건은 무엇인가요?',
    'CSR과 SSR의 차이는 무엇인가요?',
  ]);

  const handlePlay = async (questionText: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: questionText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS API Error:', errorData);
        return;
      }

      const data = await response.json();

      // Base64를 Uint8Array로 변환
      const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));

      // Blob 생성 및 오디오 재생
      const blob = new Blob([audioBytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.play().catch((error) => {
        console.error('Audio play error:', error);
      });
    } catch (error) {
      console.error('TTS request error:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {questions.map((question, index) => (
        <div key={index} className="flex flex-col gap-2">
          <input type="text" value={question} readOnly className="p-2 border rounded-md" />
          <button
            className="bg-blue-500 text-white p-2 rounded-md w-[100px]"
            onClick={() => handlePlay(question)}
          >
            재생
          </button>
        </div>
      ))}
    </div>
  );
}
