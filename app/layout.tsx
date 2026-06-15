import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import AuthProvider from '@/components/layout/AuthProvider';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

import Footer from '@/components/layout/Footer';
import SupportBar from '@/components/layout/SupportBar';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Báo cáo Khám Sức khỏe Toàn dân | Thành phố Đà Nẵng',
  description: 'Hệ thống báo cáo số liệu khám sức khỏe định kỳ cho các đơn vị y tế trên địa bàn.',
  keywords: ['sức khỏe', 'khám sức khỏe', 'CDC', 'y tế', 'báo cáo'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col pb-9">
        <AuthProvider>
          <Navbar />
          <main className="pt-16 flex-1">{children}</main>
          <Footer />
          <SupportBar />
        </AuthProvider>
      </body>
    </html>
  );
}
