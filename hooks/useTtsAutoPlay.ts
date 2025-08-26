import { useEffect, useRef, useState } from 'react';

export function useTtsAutoPlay(
  src: string | undefined,
  onReadyToRecord: () => void,
  enabled: boolean = true
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callbackRef = useRef(onReadyToRecord);
  const [isPlaying, setIsPlaying] = useState(false);

  // 같은 질문에서 콜백이 변해도 재생은 1번만
  useEffect(() => {
    callbackRef.current = onReadyToRecord;
  }, [onReadyToRecord]);

  // 비활성화 시 즉시 정지
  useEffect(() => {
    if (enabled) return;
    const el = audioRef.current;
    if (el) {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {}
    }
    setIsPlaying(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!src) return;
    const el = audioRef.current;
    if (!el) return;
    // 재생 완료 시 다음 단계
    const onEnded = () => {
      setIsPlaying(false);
      callbackRef.current();
    };
    // 에러시: 한 번만 재시도 후 실패 시 다음단계
    let retried = false;
    const handleError = () => {
      if (!retried) {
        retried = true;
        try {
          el.pause();
          el.currentTime = 0;
          // 동일 src 재시도
          if (el.src !== src) el.src = src;
          if (typeof (el as any).load === 'function') {
            (el as any).load();
          }
        } catch {}
        el.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
            callbackRef.current();
          });
      } else {
        setIsPlaying(false);
        callbackRef.current();
      }
    };
    const onError = () => {
      handleError();
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
    // 재생 시도 (실패 시 한 번 재시도)
    el.play()
      .then(() => setIsPlaying(true))
      .catch(handleError);

    return () => {
      el.pause();
      el.currentTime = 0;
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [src, enabled]);

  return { audioRef, isPlaying } as const;
}
