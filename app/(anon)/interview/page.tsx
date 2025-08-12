'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
// import Header from '@/app/components/ex'; // 임시로 주석 처리
// import { DUMMY_QUESTIONS } from '@/constants/index'; // 임시로 주석 처리

// Icons
import PlayIcon from '@/public/assets/icons/play.svg';
import PauseIcon from '@/public/assets/icons/pause.svg';
import MicIcon from '@/public/assets/icons/mic.svg';
import NextIcon from '@/public/assets/icons/skip-forward.svg';
import StopIcon from '@/public/assets/icons/square.svg';

type Question = {
  questionId: number;
  question: string;
  order: number;
};

type RecordingStatus = 'not_started' | 'recording' | 'completed' | 'uploading';

// 테스트를 위한 더미 데이터
const DUMMY_QUESTIONS_FOR_TEST: Question[] = [
  { questionId: 1, question: '첫 번째 질문입니다. 자기소개를 해보세요.', order: 1 },
  { questionId: 2, question: '두 번째 질문입니다. 지원 동기는 무엇인가요?', order: 2 },
  { questionId: 3, question: '세 번째 질문입니다. 프로젝트 경험에 대해 설명해주세요.', order: 3 },
];

export default function InterviewPage() {
  const [questions, setQuestions] = useState<Question[]>(DUMMY_QUESTIONS_FOR_TEST);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('not_started');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // TODO: 실제로는 reportId를 props나 URL에서 가져와야 합니다.
  const reportId = 6;

  const currentQuestion = questions[currentQuestionIndex];

  const startRecording = async () => {
    setRecordingStatus('recording');
    audioChunksRef.current = []; // 이전 녹음 데이터 초기화

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('마이크 접근에 실패했습니다.', error);
      setRecordingStatus('not_started');
    }
  };

  const stopRecordingAndUpload = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = async () => {
        setRecordingStatus('uploading');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audio', audioBlob, `recording_${reportId}_${currentQuestion.order}.webm`);

        try {
          console.log(`Uploading: reportId=${reportId}, order=${currentQuestion.order}`);
          const response = await fetch(
            `/api/reports/${reportId}/recording?order=${currentQuestion.order}`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`녹음 파일 업로드에 실패했습니다: ${response.status} ${errorText}`);
          }

          const result = await response.json();
          console.log('업로드 성공:', result);
          setRecordingStatus('completed');
        } catch (error) {
          console.error(error);
          setRecordingStatus('not_started'); // 실패 시 상태 초기화
        }
      };
      mediaRecorderRef.current.stop();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setRecordingStatus('not_started');
    } else {
      // 면접 종료 처리
      alert('모든 질문에 대한 답변이 완료되었습니다.');
    }
  };

  const handleRecordingButtonClick = () => {
    if (recordingStatus === 'not_started') {
      startRecording();
    } else if (recordingStatus === 'recording') {
      stopRecordingAndUpload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* <Header /> */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-6">
            <span className="text-lg font-semibold text-gray-500">
              질문 {currentQuestionIndex + 1} / {questions.length}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {currentQuestion?.question || '질문을 불러오는 중입니다...'}
            </h2>
          </div>

          <div className="flex items-center justify-center space-x-4 my-8">
            <button
              onClick={handleRecordingButtonClick}
              disabled={recordingStatus === 'uploading' || recordingStatus === 'completed'}
              className="p-6 rounded-full bg-red-500 text-white disabled:bg-gray-300 hover:bg-red-600 transition-colors data-[recording=true]:animate-pulse"
              data-recording={recordingStatus === 'recording'}
            >
              {recordingStatus === 'recording' ? (
                <StopIcon className="w-8 h-8" />
              ) : (
                <MicIcon className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={handleNextQuestion}
              disabled={recordingStatus === 'recording' || recordingStatus === 'uploading'}
              className="w-full py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {recordingStatus === 'uploading' ? '답변을 저장하는 중...' : '다음 질문'}
              {recordingStatus !== 'uploading' && (
                <NextIcon className="inline-block w-5 h-5 ml-2" />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
