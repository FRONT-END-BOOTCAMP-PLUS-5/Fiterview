import { useRouter } from 'next/navigation';
import { useModalStore } from '@/stores/useModalStore';
import Logout from '@/public/assets/icons/logout.svg';
import User from '@/public/assets/icons/user.svg';
import LogoutModal from '../modal/LogoutModal';

export default function DropDown() {
  const router = useRouter();
  const { isOpen, currentStep, openModal } = useModalStore();

  return (
    <nav className="w-[150px] absolute right-0 top-8 z-20 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.10)] outline-1 outline-offset-[-1px] outline-[#E2E8F0] ">
      <ul className="flex flex-col">
        <li>
          <button
            type="button"
            className="w-full px-4 py-3 gap-3 flex items-center justify-center rounded-t-[8px] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] cursor-pointer"
            onClick={() => router.push('/user')}
          >
            <User width={18} height={18} stroke="#334155" strokeWidth={1.5} />
            <span className="w-full text-start text-[#334155] text-sm font-medium">마이페이지</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="w-full px-4 py-3 gap-3 flex items-center justify-center rounded-b-[8px] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] cursor-pointer"
            onClick={() => openModal('logout')}
          >
            <Logout width={18} height={18} stroke="#EF4444" strokeWidth={1.5} />
            <span className="w-full text-start text-[#EF4444] text-sm font-medium">로그아웃</span>
          </button>
        </li>
      </ul>
      {isOpen && currentStep === 'logout' && <LogoutModal />}
    </nav>
  );
}
