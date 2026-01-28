import type { Metadata } from 'next';
import './globals.css';
import { SoundProvider } from '@/hooks/useSound';

export const metadata: Metadata = {
  title: '我们的纪念日',
  description: '记录两个人的美好时光',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SoundProvider>
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}
