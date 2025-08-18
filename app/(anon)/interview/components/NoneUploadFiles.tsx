'use client';

import FileX from '@/public/assets/icons/fileX.svg';

export function NoneUploadFiles() {
  return (
    <div className="h-full self-stretch bg-white rounded-lg outline-1 outline-offset-[-1px] outline-gray-100 inline-flex flex-col justify-center items-center gap-3">
      <div className="flex flex-col justify-center items-center gap-3 ">
        <div className="w-20 h-20 bg-[#F8FAFC] rounded-[100px] flex justify-center items-center">
          <FileX width={48} height={48} strokeWidth={3} stroke="#CBD5E1" />
        </div>
        <div className="text-center justify-start text-slate-500 text-sm font-medium">
          업로드된 파일이 없습니다.
        </div>
      </div>
    </div>
  );
}
