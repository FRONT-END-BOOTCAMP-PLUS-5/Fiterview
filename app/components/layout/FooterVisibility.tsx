'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterVisibility() {
  const pathname = usePathname();

  if (!pathname) return null;

  const hideFooter =
    pathname === '/signup' || pathname === '/login' || /^\/interview\/[^/]+$/.test(pathname);

  if (hideFooter) return null;

  return <Footer />;
}
