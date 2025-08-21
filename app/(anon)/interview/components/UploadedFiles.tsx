'use client';

import FileItem from '@/app/(anon)/interview/components/FileItem';
import { NoneUploadFiles } from '@/app/(anon)/interview/components/NoneUploadFiles';
import { UploadedItem } from '@/types/file';

type SourceType = 'portfolio' | 'job';

interface UploadedFilesProps {
  files: UploadedItem[];
  onRemove?: (id: string) => void;
  limitExceeded?: boolean;
}

export default function UploadedFiles({ files, onRemove, limitExceeded }: UploadedFilesProps) {
  if (files.length === 0) {
    return (
      <div className="self-stretch flex flex-col justify-start items-start gap-2 h-[328px]">
        <NoneUploadFiles />
      </div>
    );
  }

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-2 h-[328px]">
      {files.map((f) => (
        <FileItem key={`files-${f.id}`} file={f} onRemove={onRemove} />
      ))}
      {(limitExceeded || files.length > 6) && (
        <span className="text-red-500 text-xs pl-1">최대 6개까지 업로드할 수 있어요.</span>
      )}
    </div>
  );
}
