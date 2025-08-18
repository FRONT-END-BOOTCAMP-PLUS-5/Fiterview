// 파일 관련 타입 정의

export type SourceType = 'portfolio' | 'job';

// 최소한의 필수 속성만 포함
export interface UploadedItem {
  id: string;
  name: string;
  file: File;
}

export interface FileItemProps {
  file: UploadedItem;
  onRemove?: (id: string) => void;
}

export interface UploadedFilesProps {
  files: UploadedItem[];
  onRemove?: (id: string) => void;
  limitExceeded?: boolean;
}

export interface UploadOptionsProps {
  onAddFiles: (files: File[], source: SourceType) => void;
}
