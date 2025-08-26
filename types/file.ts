export type SourceType = 'portfolio' | 'job';
export interface UploadedItem {
  id: string;
  name: string;
  file: File;
  size: number;
  type: string;
  source: SourceType;
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
