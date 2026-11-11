import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '아파트 실거래가',
  description: '아파트 매매·전월세 실거래가 조회 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
