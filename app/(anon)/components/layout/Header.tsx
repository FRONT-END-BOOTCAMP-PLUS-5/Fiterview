'use client';

import Logo from '@/public/assets/images/logo1.png';
import Arrow from '@/public/assets/icons/arrow-down.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSessionUser } from '@/lib/auth/useSessionUser';
import DropDown from '@/app/(anon)/components/user/DropDown';
import { useState } from 'react';
import LogoutModal from '@/app/(anon)/components/modal/LogoutModal';

export default function Header() {
  const router = useRouter();
  const { user } = useSessionUser();
  const username = user?.nickname;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="w-full h-20 px-9 bg-white border-b border-[#F1F5F9] inline-flex justify-between items-center">
      <nav className="flex-1 flex justify-between items-center">
        <div className="flex justify-start items-center gap-16">
          <button type="button" onClick={() => router.push('/')}>
            <Image src={Logo} alt="Logo" width={104} height={40} />
          </button>
          <ul className="flex justify-start items-center gap-6">
            <li>
              <button
                type="button"
                className="text-[#334155] font-medium cursor-pointer"
                onClick={() => router.push('/interview')}
              >
                모의면접
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-[#334155] font-semibold cursor-pointer"
                onClick={() => router.push('/reports')}
              >
                기록
              </button>
            </li>
          </ul>
        </div>
        <ul className="flex justify-end items-center gap-6">
          {username ? (
            <li
              className="relative"
              onBlur={(e) => {
                const next = e.relatedTarget as Node | null;
                if (!next || !e.currentTarget.contains(next)) {
                  setIsDropdownOpen(false);
                }
              }}
            >
              <button
                className="flex justify-center items-center gap-2"
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span className="justify-start text-[#334155] text-[14px] font-medium cursor-default">
                  {username}
                </span>
                <Arrow
                  width={16}
                  height={16}
                  stroke="#94A3B8"
                  strokeWidth={1.33}
                  className={isDropdownOpen ? 'rotate-0' : 'rotate-180'}
                />
              </button>
              {isDropdownOpen && <DropDown />}
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
      <LogoutModal />
    </header>
  );
}
