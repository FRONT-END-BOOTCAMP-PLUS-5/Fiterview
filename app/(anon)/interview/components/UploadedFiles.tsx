'use client';

import Del from '@/public/assets/icons/x.svg';
import { NoneUploadFiles } from './NoneUploadFiles';

type SourceType = 'portfolio' | 'job';
type UploadedItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  source: SourceType;
  file: File;
};

interface UploadedFilesProps {
  files: UploadedItem[];
  onRemove?: (id: string) => void;
  limitExceeded?: boolean;
}

export default function UploadedFiles({ files, onRemove, limitExceeded }: UploadedFilesProps) {
  if (files.length === 0) {
    return (
      <div className="h-full self-stretch flex flex-col justify-start items-start gap-6 mt-10">
        <h3 className="self-stretch justify-start text-slate-800 text-xl font-semibold">
          업로드된 파일
        </h3>
        <NoneUploadFiles />
      </div>
    );
  }

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-6 mt-10">
      <h3 className="self-stretch justify-start text-slate-800 text-xl font-semibold">
        업로드된 파일
      </h3>
      <div className="self-stretch flex flex-col justify-start items-start gap-2 h-full">
        {files.map((f, index) => (
          <div
            key={f.id}
            className="self-stretch p-3 bg-slate-100 rounded-lg inline-flex justify-start items-center gap-3"
          >
            <div className="flex-1 flex justify-between items-start gap-0.5">
              <div className="flex-1 flex flex-col">
                <span className="justify-start text-slate-800 text-sm font-medium">{f.name}</span>
              </div>
              <button type="button" onClick={() => onRemove?.(f.id)} aria-label="remove">
                <Del width={16} height={16} stroke="#A0A0A0" strokeWidth={1.33} />
              </button>
            </div>
          </div>
        ))}
        {(limitExceeded || files.length > 6) && (
          <span className="text-red-500 text-xs pl-1">최대 6개까지 업로드할 수 있어요.</span>
        )}
      </div>
    </div>
  );
}
