export type SourceType = 'portfolio' | 'job';
export interface UploadedItem {
  id: string;
  name: string;
  file: File;
  size: number;
  type: string;
  source: SourceType;
}
export interface RemoveHandler {
  onRemove: (id: string) => void;
}
export interface FileItemProps extends RemoveHandler {
  file: UploadedItem;
  maxLength: number;
}
export interface UploadedFilesProps extends RemoveHandler {
  files: UploadedItem[];
  limitExceeded: boolean;
}
export interface UploadOptionsProps {
  onAddFiles: (files: File[], source: SourceType) => void;
}
