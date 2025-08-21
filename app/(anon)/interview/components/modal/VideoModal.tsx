'use client';

import { useMemo } from 'react';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';
import { useRouter } from 'next/navigation';
import { YOUTUBE_URLS } from '@/constants/videourls';

function toEmbedUrl(watchUrl: string): string {
  try {
    const url = new URL(watchUrl);
    const id = url.searchParams.get('v');
    if (!id) return watchUrl;
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  } catch {
    return watchUrl;
  }
}

export default function VideoModal({ reportId }: { reportId: number }) {
  const router = useRouter();
  const { isOpen, closeModal, currentStep } = useModalStore();

  const embedSrc = useMemo(() => {
    const idx = Math.floor(Math.random() * YOUTUBE_URLS.length);
    return toEmbedUrl(YOUTUBE_URLS[idx]);
  }, []);

  if (!isOpen || currentStep !== 'video') return null;

  const Body = () => (
    <div className="w-full">
      <div className="w-full rounded-lg overflow-hidden bg-black">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedSrc}
            title="추천 면접 영상"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
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
