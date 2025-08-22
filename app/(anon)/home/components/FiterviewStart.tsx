'use client';
import Start from '@/public/assets/icons/rocket.svg';
import { useRouter } from 'next/navigation';

export default function FiterviewStart() {
  const router = useRouter();

  return (
    <div className="w-full px-28 py-20 bg-[#3B82F6] flex flex-col justify-start items-center gap-8">
      <div className="w-full flex flex-col justify-start items-center gap-6">
        <h2 className="text-center justify-start text-white text-[28px] font-bold">
          지금 바로 면접 준비를 시작하세요
        </h2>
        <p className="text-[#C7D2FE] text-[16px] font-normal leading-tight">
          무료로 첫 번째 맞춤형 면접 질문 세트를 생성해보세요
        </p>
        <button
          className="h-14 px-8 bg-white rounded-[12px] flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => router.push('/login')}
        >
          <Start width={20} height={20} stroke="#3B82F6" strokeWidth={1.67} />
          <p className="text-[#3B82F6] text-[16px] font-semibold leading-tight">
            로그인하고 시작하기
          </p>
        </button>
      </div>
    </div>
  );
}
