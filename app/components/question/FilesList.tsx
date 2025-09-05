'use client';

import FileItem from '@/app/components/question/FileItem';
import { UploadedFilesProps } from '@/types/file';

interface FilesListProps extends UploadedFilesProps {
  maxFileLength: number;
  noneContainerClass: string;
  containerClass: string;
  emptyComponent: React.ReactNode;
  fileItemComponent: React.ElementType;
  warningClass: string;
}

export default function FilesList({
  files,
  limitExceeded,
  onRemove,
  containerClass,
  emptyComponent,
  maxFileLength,
  warningClass,
  noneContainerClass,
}: FilesListProps) {
  if (files.length === 0) {
    return <div className={noneContainerClass}>{emptyComponent}</div>;
  }

  return (
    <div className={containerClass}>
      {files.map((file) => (
        <FileItem
          key={`files-${file.id}`}
          file={file}
          onRemove={onRemove}
          maxLength={maxFileLength}
        />
      ))}
      {(limitExceeded || files.length > 6) && (
        <span className={warningClass}>최대 6개까지 업로드할 수 있어요.</span>
      )}
    </div>
  );
}
