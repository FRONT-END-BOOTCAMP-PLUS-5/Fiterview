import { useEffect, useRef } from 'react';

export function useTtsAutoPlay(src: string | undefined, onReadyToRecord: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const el = audioRef.current;
    if (!el) return;

    const ready = () => onReadyToRecord();

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
  }, [src, onReadyToRecord]);

  return { audioRef } as const;
}
