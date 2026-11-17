import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'MHC Visitor Registration & One-Time Gate Pass',
  description: 'May Harvest Corporation - Enterprise Visitor Monitoring & Security Gate Pass',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, font: '15px Arial, sans-serif', background: '#1c854c', color: '#17212b', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '20px auto', padding: '0 16px' }}>
          {children}
        </main>
        <footer className="muted no-print" style={{ textAlign: 'center', padding: '16px', color: '#e8f5ec', fontSize: '13px' }}>
          May Harvest Corporation • Secure Plant Access Control • Philippine Data Privacy Act (RA 10173) Compliant
        </footer>
      </body>
    </html>
  );
}
