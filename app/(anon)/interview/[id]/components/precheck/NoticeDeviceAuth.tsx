'use client';
import Chrome from '@/public/assets/icons/chrome.svg';
import Safari from '@/public/assets/icons/safari.svg';

export default function NoticeDeviceAuth() {
  return (
    <div className="absolute top-[-16px] left-full ml-4 whitespace-nowrap p-4 bg-white rounded-[8px] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.06)] inline-flex flex-col justify-start items-start gap-2 cursor-default">
      <h3 className="font-semibold text-[14px] text-[#111827]">권한이 없다고 표시되는 경우</h3>
      <div className="flex flex-col gap-[6px]">
        <div className="flex gap-[6px] items-center">
          <Chrome width={16} height={16} strokeWidth={1.2} stroke="#3B82F6" />
          <p className="font-medium text-[13px] text-[#111827]">Chrome</p>
        </div>
        <p className="font-medium text-[12px] text-[#6B7280]">
          {`주소창 좌측 아이콘 → 카메라/마이크 '허용'`}
        </p>
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex gap-[6px] items-center">
          <Safari width={16} height={16} strokeWidth={1.2} stroke="#3B82F6" />
          <p className="font-medium text-[13px] text-[#111827]">Safari</p>
        </div>
        <p className="font-medium text-[12px] text-[#6B7280]">
          {`Safari → 설정 → 웹사이트 → 카메라/마이크 '허용'`}
        </p>
      </div>
    </div>
  );
}
