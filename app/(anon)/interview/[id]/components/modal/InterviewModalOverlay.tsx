'use client';

import { ReactNode } from 'react';

interface InterviewModalOverlayProps {
  isOpen: boolean;
  children: ReactNode;
}

export default function InterviewModalOverlay({ isOpen, children }: InterviewModalOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative max-h-[90vh] overflow-y-auto rounded-[16px]">{children}</div>
    </div>
  );
}
