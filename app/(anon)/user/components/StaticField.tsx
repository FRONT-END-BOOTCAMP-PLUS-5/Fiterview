'use client';

import React from 'react';

interface StaticFieldProps {
  label: string;
  value?: string;
}

export default function StaticField({ label, value }: StaticFieldProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-sm leading-[16.8px] font-semibold text-gray-700">{label}</p>
      <div className="w-full flex py-[12px] px-[16px] bg-[#F8FAFC] justify-center rounded-[8px] border border-[#CBD5E1]">
        <span className="w-full text-[16px] font-normal text-[#928A8A] truncate">
          {value || '-'}
        </span>
      </div>
      <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]" />
    </div>
  );
}
