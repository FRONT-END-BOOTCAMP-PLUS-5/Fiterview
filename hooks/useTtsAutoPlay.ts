import { useEffect, useRef } from 'react';

export function useTtsAutoPlay(src: string | undefined, onReadyToRecord: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callbackRef = useRef(onReadyToRecord);

  useEffect(() => {
    callbackRef.current = onReadyToRecord;
  }, [onReadyToRecord]);

  useEffect(() => {
    if (!src) return;
    const el = audioRef.current;
    if (!el) return;

    const ready = () => callbackRef.current();

    el.src = src;
    el.addEventListener('ended', ready);
    el.addEventListener('error', ready);
    el.play().catch(ready);

    return () => {
      el.pause();
      el.currentTime = 0;
      el.removeEventListener('ended', ready);
      el.removeEventListener('error', ready);
    };
  }, [src]);

  return { audioRef } as const;
}
