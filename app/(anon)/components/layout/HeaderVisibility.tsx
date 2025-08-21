'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function HeaderVisibility() {
  const pathname = usePathname();

  if (!pathname) return null;

  const hideHeader =
    pathname === '/signup' || pathname === '/login' || /^\/interview\/[^/]+$/.test(pathname);

  if (hideHeader) return null;

  return <Header />;
}
