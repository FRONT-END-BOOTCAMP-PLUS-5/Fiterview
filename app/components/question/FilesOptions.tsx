'use client';

import Upload from '@/public/assets/icons/upload.svg';
import Picture from '@/public/assets/icons/image.svg';
import { useEffect, useRef, useState } from 'react';
import { UploadOptionsProps } from '@/types/file';

const uploadOptions = [
  {
    key: 'portfolio',
    label: '포트폴리오 업로드',
    sub: 'PDF 파일',
    accept: 'application/pdf',
    icon: <Upload width={48} height={48} strokeWidth={2} stroke="#3B82F6" />,
  },
  {
    key: 'job',
    label: '채용공고 업로드',
    sub: '캡처 이미지 (선택사항)',
    accept: 'image/png,image/jpeg,image/jpg',
    icon: <Picture width={48} height={48} strokeWidth={2} stroke="#0EA5E9" />,
  },
];

export default function FilesOptions({ onAddFiles }: UploadOptionsProps) {
  const [selected, setSelected] = useState<'portfolio' | 'job' | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);
  const jobInputRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = {
    portfolio: portfolioInputRef,
    job: jobInputRef,
  };
  const pasteImageCounterRef = useRef(1);

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) return;

    const pdfFiles = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    const imageFiles = files.filter(
      (f) => /^image\/(png|jpeg|jpg)$/i.test(f.type) || /\.(png|jpe?g)$/i.test(f.name)
    );

    if (pdfFiles.length > 0) {
      onAddFiles(pdfFiles, 'portfolio');
      setSelected('portfolio');
    }
    if (imageFiles.length > 0) {
      const renamed = imageFiles.map((f) => {
        const lower = f.name.toLowerCase();
        const match = lower.match(/^(image)\.(png|jpe?g)$/i);
        if (!match) return f;
        const base = match[1];
        const ext = match[2].toLowerCase();
        const next = pasteImageCounterRef.current++;
        const newName = `${base}-${next}.${ext}`;
        return new File([f], newName, {
          type: f.type,
          lastModified: (f as any).lastModified ?? Date.now(),
        });
      });
      onAddFiles(renamed, 'job');
      setSelected('job');
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste as EventListener);
    return () => window.removeEventListener('paste', handlePaste as EventListener);
  });

  //css
  const baseClasses =
    'group flex-1 w-full h-full justify-center rounded-xl outline-2 outline-offset-[-2px] inline-flex flex-col transition-colors duration-200 cursor-pointer';
  const unselectedClasses =
    'bg-white outline-slate-300 hover:bg-sky-50 hover:outline-sky-500 active:bg-sky-50 active:outline-sky-500';
  const selectedClasses = 'bg-sky-50 outline-sky-500';

  const subtitleClass = (isSelected: boolean) =>
    `text-center text-sm ${
      isSelected
        ? 'text-sky-700 font-normal'
        : 'text-slate-400 group-hover:text-sky-700 group-hover:font-normal group-active:text-sky-700 group-active:font-normal'
    }`;

  return (
    <div className="self-stretch flex gap-8 w-full h-[200px]">
      {uploadOptions.map((option) => (
        <div key={option.key} className="w-full h-full">
          <input
            ref={inputRefs[option.key as 'portfolio' | 'job']}
            type="file"
            accept={option.accept}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length > 0) {
                onAddFiles(files, option.key as 'portfolio' | 'job');
                setSelected(option.key as 'portfolio' | 'job');
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              setSelected(option.key as 'portfolio' | 'job');
              inputRefs[option.key as 'portfolio' | 'job'].current?.click();
            }}
            className={`${baseClasses} ${selected === option.key ? selectedClasses : unselectedClasses}`}
          >
            <div className="flex flex-col items-center gap-2">
              {option.icon}
              <p className="text-center text-slate-600 text-base font-semibold">{option.label}</p>
              <p className={subtitleClass(selected === 'portfolio')}>{option.sub}</p>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
