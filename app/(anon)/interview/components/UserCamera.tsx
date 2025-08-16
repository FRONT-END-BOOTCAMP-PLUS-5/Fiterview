'use client';

export default function UserCamera({ message = '카메라 연결 실패' }: { message?: string }) {
  return (
    <div
      className={`w-[360px] h-[400px] border border-[#E2E8F0] rounded-[12px] flex items-center justify-center text-[#94A3B8] `}
    >
      {message}
    </div>
  );
}
