import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'MHC Visitor Registration & Gate Pass System',
  description: 'May Harvest Corporation - Enterprise Visitor Monitoring & Security Gate Pass',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>
        <footer className="bg-slate-100 border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
          May Harvest Corporation • Secure Plant Access Control • Philippine Data Privacy Act (RA 10173) Compliant
        </footer>
      </body>
    </html>
  );
}
