'use client';

import FileItem from '@/app/(anon)/home/components/quick/FileItem';
import { NoneFiles } from '@/app/(anon)/home/components/quick/NoneFiles';
import { UploadedItem } from '@/types/file';

interface UploadedFilesProps {
  files: UploadedItem[];
  onRemove?: (id: string) => void;
  limitExceeded?: boolean;
}

export default function FilesUpload({ files, onRemove, limitExceeded }: UploadedFilesProps) {
  if (files.length === 0) {
    return (
      <div className="self-stretch flex flex-col justify-start items-start gap-2 h-[147px]">
        <NoneFiles />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {files.map((f) => (
        <FileItem key={`files-${f.id}`} file={f} onRemove={onRemove} />
      ))}
      {(limitExceeded || files.length > 6) && (
        <span className="text-start text-red-500 text-xs pl-1">
          최대 6개까지 업로드할 수 있어요.
        </span>
      )}
    </div>
  );
}
