interface LoginButtonProps {
  loading: boolean;
  isFormReady: boolean;
  error: string;
}

export default function LoginButton({ loading, isFormReady, error }: LoginButtonProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="submit"
        disabled={!isFormReady}
        className={`${isFormReady ? 'bg-[#3B82F6] text-white cursor-pointer' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'} h-[52px] rounded-[8px] inline-flex justify-center items-center text-[16px] font-semibold`}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <div className="min-h-[18px] -mt-2 -mb-2">
        {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
      </div>
    </div>
  );
}
