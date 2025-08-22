import { useState } from 'react';
import { UploadedItem } from '@/types/file';

export type SourceType = 'portfolio' | 'job';

interface UseUploadFilesReturn {
  uploadedFiles: UploadedItem[];
  limitExceeded: boolean;
  handleAddFiles: (files: File[], source: SourceType) => void;
  handleRemoveFile: (id: string) => void;
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedItem[]>>;
  setLimitExceeded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useUploadFiles(): UseUploadFilesReturn {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedItem[]>([]);
  const [limitExceeded, setLimitExceeded] = useState(false);

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

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    setLimitExceeded(false);
  };

  return {
    uploadedFiles,
    limitExceeded,
    handleAddFiles,
    handleRemoveFile,
    setUploadedFiles,
    setLimitExceeded,
  };
}
