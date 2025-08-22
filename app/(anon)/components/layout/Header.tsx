'use client';

import { useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSessionUser } from '@/lib/auth/useSessionUser';
import DropDown from '@/app/(anon)/components/layout/DropDown';
import { useModalStore } from '@/stores/useModalStore';
import LogoutModal from '@/app/(anon)/components/modal/LogoutModal';
import { LoadingSpinner } from '@/app/(anon)/components/loading/LoadingSpinner';
import Logo1 from '@/public/assets/icons/logo1.svg';
import Arrow from '@/public/assets/icons/arrow-down.svg';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useSessionUser();
  const username = user?.nickname;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const { isOpen, currentStep } = useModalStore();

  return (
    <header className="w-full h-20 px-9 bg-white border-b border-[#F1F5F9] inline-flex justify-between items-center">
      <nav className="flex-1 flex justify-between items-center">
        <div className="flex justify-start items-center gap-16">
          <button className="cursor-pointer" type="button" onClick={() => router.push('/')}>
            <Logo1 width={104} height={40} />
          </button>
          <ul className="flex justify-start items-center gap-6">
            <li>
              <button
                type="button"
                className={`text-[#334155] cursor-pointer ${pathname === '/interview' ? 'font-bold' : 'font-medium'}`}
                onClick={() => router.push('/interview')}
              >
                AI 면접
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`text-[#334155] cursor-pointer ${/^\/reports(\/[^/]+)?$/.test(pathname) ? 'font-bold' : 'font-medium'}`}
                onClick={() => router.push('/reports')}
              >
                기록
              </button>
            </li>
          </ul>
        </div>
        <ul className="flex justify-end items-center gap-6">
          {status === 'loading' ? (
            <li>
              <LoadingSpinner size="small" />
            </li>
          ) : username ? (
            <li className="relative" ref={dropdownRef}>
              <button
                className="cursor-pointer flex justify-center items-center gap-2"
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span className="whitespace-nowrap justify-start text-[#334155] text-[14px] font-medium">
                  {username}
                </span>
                <Arrow
                  width={16}
                  height={16}
                  stroke="#94A3B8"
                  strokeWidth={1.33}
                  className={isDropdownOpen ? 'rotate-180' : 'rotate-0'}
                />
              </button>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <DropDown />
                </>
              )}
            </li>
          ) : (
            <>
              <li>
                <button
                  type="button"
                  className="justify-start text-[#334155] font-medium cursor-pointer"
                  onClick={() => router.push('/signup')}
                >
                  회원가입
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="justify-start text-[#334155] font-medium cursor-pointer"
                  onClick={() => router.push('/login')}
                >
                  로그인
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
      {isOpen && currentStep === 'logout' && <LogoutModal />}
    </header>
  );
}
