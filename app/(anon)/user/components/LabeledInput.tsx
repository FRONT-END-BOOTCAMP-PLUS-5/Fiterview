'use client';

import React from 'react';
import Input, { InputProps } from '@/app/(anon)/components/Input';

interface LabeledInputProps extends InputProps {
  label: string;
  error?: string | null;
  helperClassName?: string;
}

export default function LabeledInput({
  label,
  error,
  helperClassName,
  ...inputProps
}: LabeledInputProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-sm leading-[16.8px] font-semibold text-gray-700">{label}</p>
      <Input {...inputProps} />
      <div className="w-full inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
        {error ? (
          <p className={`text-[#EF4444] text-[12px] leading-[14.4px] ${helperClassName ?? ''}`}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
