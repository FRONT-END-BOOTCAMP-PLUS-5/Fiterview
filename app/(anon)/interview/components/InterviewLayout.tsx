'use client';

import React from 'react';

interface InterviewLayoutProps {
  children: React.ReactNode;
  objectUrl: string;
  ctxReady: boolean;
}

export default function InterviewLayout({ children, objectUrl, ctxReady }: InterviewLayoutProps) {
  return (
    <main className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 좌측: 아바타 영역 */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-black h-[58vh]">
        <div className="absolute z-10 left-3 top-3 px-2 py-1 text-xs rounded bg-neutral-800/80 border border-neutral-700">
          Interviewer
        </div>

        {children}

        <div className="absolute right-3 bottom-3 text-xs px-2 py-1 rounded bg-neutral-800/80 border border-neutral-700">
          {objectUrl
            ? ctxReady
              ? 'Audio linked (RMS)'
              : 'Ready – enable AudioContext'
            : 'No audio file'}
        </div>
      </div>

      {/* 우측: 사용자 영역 */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 h-[58vh] flex items-center justify-center">
        <div className="absolute z-10 left-3 top-3 px-2 py-1 text-xs rounded bg-neutral-800/80 border border-neutral-700">
          You
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-3xl font-semibold">
            YOU
          </div>
          <div className="text-neutral-400 text-sm">Camera is off</div>
        </div>
      </div>
    </main>
  );
}
