import Link from 'next/link';

interface SignupButtonProps {
  loading: boolean;
  isFormReady: boolean;
}

export default function SignupButton({ loading, isFormReady }: SignupButtonProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="submit"
        disabled={!isFormReady}
        className={`${
          isFormReady
            ? 'bg-[#3B82F6] text-white cursor-pointer'
            : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
        } h-[52px] rounded-[8px] inline-flex justify-center items-center text-[16px] font-semibold`}
      >
        {loading ? '처리 중...' : '회원가입'}
      </button>

      <div className="inline-flex items-center justify-center gap-1">
        <p className="text-[14px] leading-[16.8px] text-[#94A3B8]">이미 계정이 있으신가요?</p>
        <Link
          href="/login"
          className="text-[14px] leading-[16.8px] text-[#3B82F6] font-semibold cursor-pointer"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
