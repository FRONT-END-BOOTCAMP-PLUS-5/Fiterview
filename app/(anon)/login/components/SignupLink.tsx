import Link from 'next/link';

export default function SignupLink() {
  return (
    <div className="inline-flex items-center justify-center gap-1">
      <p className="text-[14px] leading-[16.8px] text-[#94A3B8]">아직 계정이 없으신가요?</p>
      <Link href="/signup" className="text-[14px] leading-[16.8px] text-[#3B82F6] font-semibold">
        회원가입
      </Link>
    </div>
  );
}
