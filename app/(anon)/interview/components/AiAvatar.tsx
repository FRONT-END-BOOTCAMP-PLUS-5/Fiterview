'use client';

import Character from '@/public/assets/icons/character.svg';

export default function AiAvatar({
  className = '',
  size = 140,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex h-[500px] items-center justify-center ${className}`}>
      <Character width={size} height={(size * 90) / 140} />
    </div>
  );
}
