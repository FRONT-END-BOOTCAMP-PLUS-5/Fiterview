import { useEffect, useRef, useState } from 'react';

export function useTtsAutoPlay(src: string | undefined, onReadyToRecord: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callbackRef = useRef(onReadyToRecord);
  const [isPlaying, setIsPlaying] = useState(false);

  // 같은 질문에서 콜백이 변해도 재생은 1번만
  useEffect(() => {
    callbackRef.current = onReadyToRecord;
  }, [onReadyToRecord]);

  useEffect(() => {
    if (!src) return;
    const el = audioRef.current;
    if (!el) return;
    // 재생 완료 시 다음 단계
    const onEnded = () => {
      setIsPlaying(false);
      callbackRef.current();
    };
    // 에러시 다음단계
    const onError = () => {
      setIsPlaying(false);
      callbackRef.current();
    };
    //클릭 → play → (버퍼링) → playing → (재생 중) → pause/ended
    const onPlay = () => setIsPlaying(true);
    //실제 재생 (립싱크, 타이머 시작)
    const onPlaying = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    el.src = src;
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    el.addEventListener('playing', onPlaying);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    // 현재 상태를 즉시 반영
    setIsPlaying(!el.paused && !el.ended);
    // 재생 시도
    el.play()
      .then(() => setIsPlaying(true))
      .catch(onError);

    return () => {
      el.pause();
      el.currentTime = 0;
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [src]);

  return { audioRef, isPlaying } as const;
}
