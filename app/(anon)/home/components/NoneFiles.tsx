'use client';

import FileX from '@/public/assets/icons/fileX.svg';

export function NoneFiles() {
  return (
    <div className="h-full self-stretch bg-white rounded-lg outline-1 outline-offset-[-1px] outline-gray-100 flex flex-col justify-center items-center gap-3">
      <div className="flex flex-col justify-center items-center gap-2">
        <div className="w-14 h-14 bg-[#F8FAFC] rounded-[100px] flex justify-center items-center">
          <FileX width={32} height={32} strokeWidth={3} stroke="#CBD5E1" />
        </div>
        <div className="text-center text-slate-400 text-[14px] font-medium">
          업로드된 파일이 없습니다.
        </div>
      </div>
    </div>
  );
}
