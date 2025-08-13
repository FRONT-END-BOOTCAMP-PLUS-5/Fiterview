'use client';
import CheckCircle from '@/public/assets/icons/check-circle.svg';
import NoticeList from './components/NoticeList';
import CheckList from './components/CheckList';
import CheckDeviceStatus from './components/CheckDeviceStatus';

export default function PrecheckPage() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center py-[38px]">
      <div className="flex flex-col w-[800px] p-12 border border-[#E2E8F0] bg-white rounded-[16px] gap-[32px]">
        <section className="flex flex-col justify-center items-center ">
          <div className="w-[64px] h-[64px] bg-[#3B82F6] rounded-[32px] flex justify-center items-center">
            <div className="w-[32px] h-[32px] flex justify-center items-center">
              <CheckCircle />
            </div>
          </div>
          <p className=" text-[#1E293B] text-[24px] font-bold mt-[16px]">면접 시작 전 확인사항</p>
          <p className=" text-[#64748B] text-[16px] font-normal mt-[8px]">
            원할한 면접 진행을 위해 아래 내용을 확인해주세요
          </p>
          <NoticeList />
        </section>
        <section>
          <p className="flex items-start text-[18px] font-semibold text-[#1E293B]">사전 준비사항</p>
          <CheckList />
        </section>
        <section>
          <CheckDeviceStatus />
        </section>
      </div>
    </div>
  );
}
