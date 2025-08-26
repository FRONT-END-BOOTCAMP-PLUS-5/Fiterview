'use client';

import FileItem from '@/app/(anon)/components/quick/FileItem';
import { NoneFiles } from '@/app/(anon)/components/quick/NoneFiles';
import { UploadedFilesProps } from '@/types/file';

export default function FilesUpload({ files, onRemove, limitExceeded }: UploadedFilesProps) {
  if (files.length === 0) {
    return (
      <div className="self-stretch flex flex-col justify-start items-start gap-2 h-[147px]">
        <NoneFiles />
      </div>
    );
  }

  const gridClass = files.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2';
  return (
    <div className={`${gridClass} gap-2 w-full`}>
      {files.map((f) => (
        <FileItem key={`files-${f.id}`} file={f} onRemove={onRemove} />
      ))}
      {(limitExceeded || files.length > 6) && (
        <span className="text-start text-red-500 text-xs pl-1 col-span-2">
          최대 6개까지 업로드할 수 있어요.
        </span>
      )}
    </div>
  );
}
