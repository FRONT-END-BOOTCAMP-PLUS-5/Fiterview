import { useRouter } from 'next/navigation';
import { useModalStore } from '@/stores/useModalStore';
import Logout from '@/public/assets/icons/logout.svg';
import User from '@/public/assets/icons/user.svg';

export default function DropDown() {
  const router = useRouter();
  const { openModal } = useModalStore();

  return (
    <nav className="w-[150px] absolute right-0 top-8 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-slate-200">
      <ul className="flex flex-col">
        <li>
          <button
            type="button"
            className="w-full h-11 gap-3 flex items-center justify-center rounded-t-lg hover:bg-[#F1F5F9] active:bg-[#E2E8F0]"
            onClick={() => router.push('/user')}
          >
            <User width={18} height={18} stroke="#64748B" strokeWidth={1.5} />
            <span className="w-20 text-[#334155] text-sm font-medium">마이페이지</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="w-full h-11 gap-3 flex items-center justify-center rounded-b-lg hover:bg-[#F1F5F9] active:bg-[#E2E8F0]"
            onClick={() => openModal()}
          >
            <Logout width={18} height={18} stroke="#EF4444" strokeWidth={1.5} />
            <span className="w-20 text-[#EF4444] text-sm font-medium">로그아웃</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
