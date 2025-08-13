'use client';
import Check from '@/public/assets/icons/check.svg';

export default function CheckList() {
  return (
    <>
      <ul className="mt-[20px] gap-[11px] flex flex-col">
        <li>
          <div className="flex items-center gap-[12px]">
            <div className="w-[20px] h-[20px] bg-[#E2E8F0] rounded-[4px] border border-[#CBD5E1]"></div>
            <p className="text-[15px] text-[#334155]">
              마이크와 카메라가 정상적으로 작동하는지 확인했습니다.
            </p>
          </div>
        </li>
        <div className="flex items-center gap-[12px]">
          <div className="w-[20px] h-[20px] bg-[#10B981] rounded-[4px]">
            <Check />
          </div>
          <p className="text-[15px] text-[#334155]">조용한 환경에서 면접을 진행할 수 있습니다.</p>
        </div>{' '}
        <div className="flex items-center gap-[12px]">
          <div className="w-[20px] h-[20px] bg-[#E2E8F0] rounded-[4px]"></div>
          <p className="text-[15px] text-[#334155]">안정적인 인터넷 연결 상태를 확인했습니다.</p>
        </div>
      </ul>
    </>
  );
}
