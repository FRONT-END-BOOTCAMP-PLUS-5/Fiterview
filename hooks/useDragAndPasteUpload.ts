import { SourceType, UploadOptionsProps } from '@/types/file';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useDragAndPasteUpload(onAddFiles: (files: File[], sourceType: SourceType) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const pasteImageCounterRef = useRef(1);

  const splitFilesByType = useCallback((files: File[]) => {
    const pdfFiles = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    const imageFiles = files.filter(
      (f) => /^image\/(png|jpeg|jpg)$/i.test(f.type) || /\.(png|jpe?g)$/i.test(f.name)
    );
    return { pdfFiles, imageFiles };
  }, []);

  const renameIfGenericImage = useCallback((files: File[]) => {
    return files.map((f) => {
      const lower = f.name.toLowerCase();
      const match = lower.match(/^(image)\.(png|jpe?g)$/i);
      if (!match) return f;
      const base = match[1];
      const ext = match[2].toLowerCase();
      const next = pasteImageCounterRef.current++;
      const newName = `${base}-${next}.${ext}`;
      return new File([f], newName, {
        type: f.type,
        lastModified: (f as any).lastModified ?? Date.now(),
      });
    });
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!files || files.length === 0) return;
      const { pdfFiles, imageFiles } = splitFilesByType(files);
      if (pdfFiles.length > 0) onAddFiles(pdfFiles, 'portfolio');
      if (imageFiles.length > 0) onAddFiles(renameIfGenericImage(imageFiles), 'job');
    },
    [onAddFiles, splitFilesByType, renameIfGenericImage]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      handleFiles(files);
    };

    window.addEventListener('paste', handlePaste as unknown as EventListener);
    return () => window.removeEventListener('paste', handlePaste as unknown as EventListener);
  }, [handleFiles]);

  const dragCounter = useRef(0);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const fileList = e.dataTransfer?.files;
      if (!fileList || fileList.length === 0) return;
      handleFiles(Array.from(fileList));
    },
    [handleFiles]
  );

  return {
    isDragging,
    containerDragProps: {
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
    },
  } as const;
}

export default useDragAndPasteUpload;
