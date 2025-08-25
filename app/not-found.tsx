import Chracter from '@/public/assets/icons/character.svg';
export default function NotFound() {
  return (
    <div className="flex flex-col bg-[#F8FAFC] h-screen items-center justify-center mt-[-20px]">
      <Chracter className="w-[140px] h-[90px] stroke-none" />
      <div className="mt-[24px] px-[20px] py-[16px] items-center border border-[#E2E8F0] border-[2px] rounded-[20px]">
        <p className="text-[14px] font-medium text-[#1E293B]">앗, 길을 잃으셨네요!</p>
      </div>
      <p className="mt-[32px] text-[#3B82F6] text-[72px] font-black">404</p>
      <p className="mt-[20px] text-[#1E293B] text-[24px] font-bold text-center">
        페이지를 찾을 수 없습니다.
      </p>
      <p className="mt-[12px] text-[#64748B] text-[16px] font-normal text-center">
        요청하신 페이지가 존재하지 않거나
        <br />
        이동되었을 수 있습니다.
      </p>
    </div>
  );
}
