'use client';
import { ReactNode, MouseEvent, useEffect } from 'react';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackClick?: boolean;
}

export default function ModalOverlay({
  isOpen,
  onClose,
  children,
  closeOnBackClick = true,
}: ModalOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackClick = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackClick}
    >
      <div className="relative max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
}
