'use client';

import { useState, useRef, useEffect } from 'react';
import Play from '@/public/assets/icons/play.svg';
import Square from '@/public/assets/icons/square.svg';
import ProgressBar from '@/app/(anon)/reports/[id]/components/ProgressBar';

interface AudioPlayerProps {
  questionNumber: string;
  questionText: string;
  audioUrl: string | undefined;
  className?: string;
  disabled?: boolean;
}

export default function AudioPlayer({
  questionNumber,
  questionText,
  audioUrl,
  className = '',
  disabled,
}: AudioPlayerProps) {
  // 오디오 재생 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); //오디오 재생 시간
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null); //HTML <audio> 요소 제어
  const rafIdRef = useRef<number | null>(null); //requestAnimationFrame ID 참조  -> 부드러운 프로그래스바 업데이트 제어

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      // 오디오 메타데이터 로드 완료 시 duration 설정
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      // 오디오 데이터 로드 완료 시 duration 설정
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      // 오디오 재생 가능 시 duration 설정
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      // duration이 아직 설정되지 않았다면 다시 시도
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // 재생/일시정지 토글 함수
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      stopSmoothUpdate();
    } else {
      if (audio.readyState === 0) {
        setIsLoading(true);
      }
      audio.play();
      setIsPlaying(true);
      startSmoothUpdate();
    }
  };

  // 프로그래스바 클릭 시 재생 위치 변경
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickPosition = clickX / progressBarWidth;

    audio.currentTime = clickPosition * duration;
  };

  // 시간을 MM:SS 형식으로 포맷팅
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 프로그래스바 진행률 계산 (0-100%)
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 부드러운 프로그래스바 업데이트 시작 (requestAnimationFrame 사용)
  const startSmoothUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const tick = () => {
      if (audio.currentTime !== undefined) {
        setCurrentTime(audio.currentTime);
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  };

  // 부드러운 프로그래스바 업데이트 정지
  const stopSmoothUpdate = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  return (
    <div
      className={`px-6 py-5 bg-slate-50 rounded-lg flex flex-col justify-start items-start gap-4 ${className}`}
    >
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="flex-1 flex justify-start items-center gap-3">
          {/* 재생/일시정지 버튼 */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading || disabled}
            className={`w-12 h-12 rounded-3xl flex justify-center items-center transition-colors ${
              disabled
                ? 'bg-slate-300 cursor-not-allowed opacity-50'
                : isLoading
                  ? 'bg-blue-500 cursor-not-allowed opacity-50'
                  : 'bg-blue-500 cursor-pointer hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Square width={20} height={20} strokeWidth={1.67} stroke="#FFFFFF" />
            ) : (
              <Play width={20} height={20} strokeWidth={1.67} stroke="#FFFFFF" />
            )}
          </button>

          {/* 질문 정보 및 프로그래스바 영역 */}
          <div className="flex-1 inline-flex flex-col justify-center items-start">
            {/* 질문 번호 및 텍스트 */}
            <div className="self-stretch inline-flex justify-start items-start gap-1">
              <div className="justify-start text-slate-800 text-sm font-semibold leading-normal whitespace-pre-line">
                {questionNumber}
              </div>
              <div className="justify-start text-slate-800 text-sm font-semibold leading-normal whitespace-pre-line">
                {questionText}
              </div>
            </div>

            {/* 프로그래스바 및 시간 표시 */}
            <div className="self-stretch flex justify-between items-center gap-3 mt-2">
              <ProgressBar percent={progressPercentage} onClick={handleProgressBarClick} />
              <div className="w-20 text-right justify-start text-slate-800 text-xs font-normal leading-none">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </div>
  );
}
