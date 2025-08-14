'use client';

import React from 'react';

interface AudioControlsProps {
  fileName: string;
  objectUrl: string;
  ctxReady: boolean;
  energyUI: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPickFile: (file?: File) => void;
  onStartAudioCtx: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

export default function AudioControls({
  fileName,
  objectUrl,
  ctxReady,
  energyUI,
  audioRef,
  onPickFile,
  onStartAudioCtx,
  onPlay,
  onPause,
  onEnded,
}: AudioControlsProps) {
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onPickFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-neutral-300">오디오 파일 (mp3/wav/ogg) – 드롭 또는 선택</span>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900 p-3 flex flex-col gap-2 items-center justify-center text-neutral-400"
      >
        <input
          id="audioFile"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
        <label
          htmlFor="audioFile"
          className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 cursor-pointer hover:bg-neutral-700"
        >
          파일 선택
        </label>
        <span className="text-xs">또는 여기로 드래그 앤 드롭</span>
        {fileName && <span className="text-xs text-emerald-400">선택됨: {fileName}</span>}
      </div>

      {/* 오디오 플레이어와 컨트롤 */}
      <div className="flex items-center gap-3 mt-4">
        <audio
          ref={audioRef}
          src={objectUrl || undefined}
          controls
          className="w-80"
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        />
        <button
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          onClick={onStartAudioCtx}
          disabled={ctxReady}
        >
          {ctxReady ? 'AudioContext Ready' : 'Enable AudioContext'}
        </button>

        {/* 에너지 디버그 바 */}
        <div className="h-2 w-48 bg-neutral-800 rounded overflow-hidden border border-neutral-700">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${Math.min(100, Math.round(energyUI * 160))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
