import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';
import '@/app/globals.css';
import AuthSessionProvider from '@/app/components/provider/AuthSessionProvider';
import QueryProvider from '@/app/components/provider/QueryProvider';
import HeaderVisibility from '@/app/components/layout/HeaderVisibility';
import FooterVisibility from '@/app/components/layout/FooterVisibility';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
});

const gmarket = localFont({
  src: '../public/fonts/GmarketSansTTFBold.ttf',
  variable: '--font-gmarket',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fiterview',
  description: '이력서와 채용공고 기반 AI 맞춤 모의면접 서비스',
  icons: {
    icon: [
      {
        url: '/assets/icons/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/assets/icons/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-dvh ${pretendard.variable} ${gmarket.variable} ${roboto.variable} antialiased`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            <HeaderVisibility />
            {children}
            <FooterVisibility />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
