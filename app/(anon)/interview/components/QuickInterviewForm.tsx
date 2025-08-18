'use client';

import UploadOptions from './UploadOptions';
import UploadedFiles from './UploadedFiles';
import Sparkles from '@/public/assets/icons/sparkles.svg';
import { useState } from 'react';
import axios from 'axios';

type SourceType = 'portfolio' | 'job';
type UploadedItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  source: SourceType;
  file: File;
};

export default function QuickInterviewForm() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedItem[]>([]);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFiles = (files: File[], source: SourceType) => {
    setUploadedFiles((prev) => {
      const getFileKey = (file: File) =>
        `${file.name}:${file.size}:${file.type}:${(file as any).lastModified ?? ''}`;
      const existingKeys = new Set(prev.map((p) => getFileKey(p.file)));

      const dedupedNew = files.filter((f) => !existingKeys.has(getFileKey(f)));

      const remainingSlots = Math.max(0, 6 - prev.length);
      const toAdd = dedupedNew.slice(0, remainingSlots).map((f) => ({
        id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        source,
        file: f,
      }));

      const attemptedOverflow = dedupedNew.length > remainingSlots;
      setLimitExceeded(attemptedOverflow);

      return [...prev, ...toAdd];
    });
  };

  const submitFiles = async () => {
    if (uploadedFiles.length === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('userId', '1');
      uploadedFiles.forEach((item) => {
        formData.append('files', item.file, item.name);
      });
      await axios.post('/api/reports?userId=1', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // success: clear list and warning
      setUploadedFiles([]);
      setLimitExceeded(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex-1 inline-flex flex-col h-full">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="justify-start text-slate-800 text-3xl font-semibold">빠른 AI 면접</h2>
        <p className="text-slate-500 text-sm">포트폴리오나 채용공고를 업로드해보세요.</p>
      </div>

      <UploadOptions onAddFiles={handleAddFiles} />

      <div className="h-full">
        <UploadedFiles
          files={uploadedFiles}
          limitExceeded={limitExceeded}
          onRemove={(id) => {
            setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
            setLimitExceeded(false);
          }}
        />

        <button
          className={`w-full h-14 rounded-xl inline-flex justify-center items-center gap-3 mt-6 relative bottom-10 ${
            uploadedFiles.length === 0 || isSubmitting
              ? 'bg-slate-100 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={submitFiles}
          disabled={uploadedFiles.length === 0 || isSubmitting}
          aria-busy={isSubmitting}
        >
          <Sparkles
            width={20}
            height={20}
            strokeWidth={1.67}
            stroke={uploadedFiles.length === 0 || isSubmitting ? '#CBD5E1' : '#ffffff'}
          />
          <p
            className={`justify-start text-base font-semibold ${
              uploadedFiles.length === 0 || isSubmitting ? 'text-slate-400' : 'text-white'
            }`}
          >
            {isSubmitting ? '면접 질문 생성 중...' : '맞춤 면접 질문 생성하기'}
          </p>
        </button>
      </div>
    </section>
  );
}
