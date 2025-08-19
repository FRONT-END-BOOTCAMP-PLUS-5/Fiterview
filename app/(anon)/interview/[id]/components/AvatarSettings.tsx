'use client';

import React from 'react';

interface AvatarSettingsProps {
  avatarInput: string;
  modelUrl: string;
  onAvatarInputChange: (value: string) => void;
}

export default function AvatarSettings({
  avatarInput,
  modelUrl,
  onAvatarInputChange,
}: AvatarSettingsProps) {
  return (
    <label className="flex flex-col gap-2 md:col-span-2">
      <span className="text-sm text-neutral-300">Ready Player Me GLB URL 또는 avatarId</span>
      <input
        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 outline-none"
        value={avatarInput}
        onChange={(e) => onAvatarInputChange(e.target.value)}
      />
      <span className="text-xs text-neutral-500 break-all">Using: {modelUrl}</span>
    </label>
  );
}
