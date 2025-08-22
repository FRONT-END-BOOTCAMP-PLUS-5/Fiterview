import { ReactNode } from 'react';
import Del from '@/public/assets/icons/x.svg';

type ModalSize = 'large' | 'small';

interface ModalProps {
  title: string;
  subTitle?: string;
  body?: ReactNode;
  buttons?: ReactNode;
  onClose?: () => void;
  size?: ModalSize;
}

export default function Modal({
  title,
  subTitle,
  body,
  buttons,
  onClose,
  size = 'large',
}: ModalProps) {
  const sizeClasses = {
    large: 'w-[480px]',
    small: 'w-[384px]',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-[16px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.13)] inline-flex flex-col justify-start items-start gap-3`}
    >
      <div className="self-stretch px-6 pt-6 flex flex-col justify-start items-end gap-4">
        <div className="self-stretch flex justify-between items-start">
          <div className="flex flex-col justify-start items-start">
            <p className="w-full text-start text-[#1E293B] text-xl font-bold">{title}</p>
            {subTitle && <p className="w-full text-start text-[#64748B] text-sm">{subTitle}</p>}
          </div>
          <div
            className="w-8 h-8 rounded-lg flex justify-end items-start cursor-pointer relative top-0"
            onClick={onClose}
          >
            <Del width={16} height={16} strokeWidth={2.5} stroke="#94A3B8" />
          </div>
        </div>
      </div>
      <div className="self-stretch px-6 flex flex-col justify-center items-center gap-5">
        {body}
      </div>
      <div className="self-stretch p-6 pt-3 flex flex-col justify-start items-start gap-3">
        {buttons}
      </div>
    </div>
  );
}
