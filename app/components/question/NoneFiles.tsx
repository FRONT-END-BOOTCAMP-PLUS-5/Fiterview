'use client';

import FileX from '@/public/assets/icons/fileX.svg';

interface NoneFilesProps {
  iconSize: number;
  iconBgSize: number;
  gapSize: number;
}
export function NoneFiles({ iconSize = 32, iconBgSize = 14, gapSize = 2 }: NoneFilesProps) {
  return (
    //outline-1 outline-offset-[-1px] outline-gray-100
    <div className="h-full self-stretch bg-white rounded-lg shadow-[inset_0_2px_8px_2px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center gap-3">
      <div className={`flex flex-col justify-center items-center gap-${gapSize}`}>
        <div
          className={`w-${iconBgSize} h-${iconBgSize} bg-[#F8FAFC] rounded-[100px] flex justify-center items-center`}
        >
          <FileX width={iconSize} height={iconSize} strokeWidth={3} stroke="#CBD5E1" />
        </div>
        <div className="text-center text-slate-400 text-[14px] font-medium">
          업로드된 파일이 없습니다.
        </div>
      </div>
    </div>
  );
}
