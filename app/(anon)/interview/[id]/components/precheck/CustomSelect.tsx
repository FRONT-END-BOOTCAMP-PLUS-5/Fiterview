'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Arrow from '@/public/assets/icons/arrow.svg';
import { useTruncateText } from '@/hooks/useTruncateText';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  disabled = false,
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  // 선택 동작
  const selectAt = (idx: number) => {
    const option = options[idx];
    if (!option) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const displayLabel = selected ? selected.label : placeholder;
  const { truncatedText, originalText, isTruncated } = useTruncateText(displayLabel, {
    maxLength: 25,
  });

  // 외부 영역 클릭 시 닫기 동작
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  // activeIndex가 유효할 때 알림
  useEffect(() => {
    if (isOpen) {
      const idx = Math.max(
        0,
        options.findIndex((o) => o.value === value)
      );
      setActiveIndex(idx === -1 ? 0 : idx);
    }
  }, [isOpen, options, value]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className="w-full border border-gray-300 rounded-md p-[12px] pr-10 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
      >
        <span
          className={selected ? 'text-[#0F172A]' : 'text-[#94A3B8]'}
          title={isTruncated ? originalText : undefined}
        >
          {truncatedText}
        </span>
        <Arrow
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] transition-transform duration-200 ease-in-out ${
            isOpen ? '-rotate-90' : 'rotate-90'
          }`}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[#94A3B8] cursor-default" aria-disabled>
              선택 가능한 항목이 없습니다
            </li>
          ) : (
            options.map((opt, idx) => {
              const isActive = idx === activeIndex;
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`px-3 py-2 text-sm cursor-pointer select-none ${
                    isActive ? 'bg-[#F1F5F9]' : ''
                  } ${isSelected ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAt(idx);
                  }}
                >
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
