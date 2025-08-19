'use client';

import Character from '@/public/assets/icons/character.svg';

export default function AiAvatar() {
  return (
    <div className={`flex h-[400px] items-center justify-center`}>
      <Character width={140} height={90} strokeWidth={0} />
    </div>
  );
}
