import { FileItemProps } from '@/types/file';
import { useTruncateText } from '@/hooks/useTruncateText';
import Del from '@/public/assets/icons/x.svg';

export default function FileItem({ file, onRemove }: FileItemProps) {
  const { truncatedText, originalText, isTruncated } = useTruncateText(file.name, {
    maxLength: 36,
  });

  return (
    <div className="self-stretch p-3 bg-slate-100 rounded-lg inline-flex justify-start items-center gap-3">
      <div className="flex-1 flex justify-between items-start gap-0.5">
        <div className="flex-1 flex flex-col">
          <span
            className="justify-start text-slate-800 text-sm font-medium"
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
