'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
}) => {
  const sizePx = { small: 24, medium: 32, large: 40 }[size];

  return (
    <div
      role="status"
      aria-label={message ?? 'Loading'}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <div className="flex items-end gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block rounded-full bg-current animate-bounce will-change-transform"
            style={{
              width: Math.round(sizePx / 6),
              height: Math.round(sizePx / 6),
              animationDuration: '0.8s',
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </div>

      {message && <p className="mt-2 text-center text-sm text-gray-500">{message}</p>}
    </div>
  );
};
