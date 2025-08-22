import { UploadedItem } from '@/types/file';
import { useTruncateText } from '@/hooks/useTruncateText';
import Del from '@/public/assets/icons/x.svg';

interface FileItemProps {
  file: UploadedItem;
  onRemove?: (id: string) => void;
}

export default function FileItem({ file, onRemove }: FileItemProps) {
  const { truncatedText, originalText, isTruncated } = useTruncateText(file.name, {
    maxLength: 32,
  });

  return (
    <div className="self-stretch p-3 bg-[#F1F5F9] rounded-lg inline-flex justify-start items-center gap-3">
      <div className="flex-1 flex justify-between items-start gap-0.5">
        <div className="flex-1 flex flex-col">
          <span
            className="text-start text-[#1E293B] text-sm font-medium"
            title={isTruncated ? originalText : undefined}
          >
            {truncatedText}
          </span>
        </div>
        <button type="button" onClick={() => onRemove?.(file.id)}>
          <Del width={16} height={16} stroke="#A0A0A0" strokeWidth={1.33} />
        </button>
      </div>
    </div>
  );
}
