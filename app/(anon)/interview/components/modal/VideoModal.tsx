'use client';

import { useEffect, useMemo, useRef } from 'react';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';
import { useRouter } from 'next/navigation';
import { YOUTUBE_URLS } from '@/constants/videourls';

function extractVideoId(watchUrl: string): string | null {
  try {
    const url = new URL(watchUrl);
    return url.searchParams.get('v');
  } catch {
    return null;
  }
}

export default function VideoModal() {
  const router = useRouter();
  const { isOpen, closeModal, currentStep } = useModalStore();
  const playerContainerIdRef = useRef(`fiterview-player-${Math.random().toString(36).slice(2, 8)}`);
  const playerRef = useRef<any>(null);

  const videoId = useMemo(() => {
    const idx = Math.floor(Math.random() * YOUTUBE_URLS.length);
    return extractVideoId(YOUTUBE_URLS[idx]);
  }, []);

  useEffect(() => {
    if (!isOpen || currentStep !== 'video' || !videoId) return;

    const ensureYouTubeAPI = () =>
      new Promise<void>((resolve) => {
        const w = window as any;
        if (w.YT && w.YT.Player) {
          resolve();
          return;
        }
        const existing = document.getElementById('youtube-iframe-api');
        if (!existing) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
        }
        const check = () => {
          if ((w as any).YT && (w as any).YT.Player) {
            resolve();
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      });

    let destroyed = false;

    ensureYouTubeAPI().then(() => {
      if (destroyed) return;
      const w = window as any;
      try {
        playerRef.current = new w.YT.Player(playerContainerIdRef.current, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onStateChange: (e: any) => {
              if (e?.data === w.YT.PlayerState.ENDED) {
                closeModal();
                router.push(`/reports`);
              }
            },
          },
        });
      } catch (_) {}
    });

    return () => {
      destroyed = true;
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (_) {}
    };
  }, [isOpen, currentStep, closeModal, router, videoId]);

  if (!isOpen || currentStep !== 'video') return null;

  const Body = () => (
    <div className="w-full">
      <div className="w-full rounded-lg overflow-hidden bg-black">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <div id={playerContainerIdRef.current} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
    </div>
  );

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        size="large"
        title="레포트를 발행 중입니다..."
        subTitle="wait a minute! 면접왕의 레슨을 들어보는 건 어떤가요?"
        onClose={() => {
          closeModal();
          router.push(`/reports`);
        }}
        body={<Body />}
      />
    </ModalOverlay>
  );
}
