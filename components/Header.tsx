'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Tuesday, Nov 17, 2026 • 10:05:32 AM
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      const datePart = now.toLocaleDateString('en-US', optionsDate);
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(`${datePart} • ${timePart}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="no-print" style={{ background: '#0e3d24', color: '#fff', padding: '16px 24px', borderBottom: '3px solid #16a34a' }}>
      <div style={{ maxWidth: 1250, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 62, height: 62, background: '#fff', borderRadius: 10, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            <img src="/mhc-logo.png" alt="May Harvest Corporation" style={{ width: 54, height: 54, objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              May Harvest Corporation
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#a7f3d0', fontWeight: 500 }}>
              Visitor, Supplier &amp; Trucker Monitoring • One-Time Gate Pass
            </p>
          </div>
        </div>

        {/* Upper Right: Live Running Clock & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {currentTime ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                background: '#166534',
                color: '#ecfdf5',
                border: '1px solid #22c55e',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                fontFamily: 'monospace, Arial, sans-serif',
              }}
            >
              <span style={{ fontSize: 14 }}>🕒</span>
              <span>{currentTime}</span>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#a7f3d0' }}>Nagkakarga ng oras...</div>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', border: '1px solid rgba(134, 239, 172, 0.3)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}></span>
            Online &amp; RA 10173 Compliant
          </span>
        </div>
      </div>
    </header>
  );
}

export function Navigation({ activeTab }: { activeTab?: string }) {
  const tabs = [
    { id: 'register', label: 'Register Visitor', href: '/' },
    { id: 'qr', label: '📱 Scan to Register (QR Standee)', href: '/qr-register' },
    { id: 'records', label: 'Monitoring Records', href: '/records' },
    { id: 'guard', label: 'Security Approval / Guard', href: '/guard' },
    { id: 'pass', label: 'Gate Pass', href: '/pass' },
  ];

  return (
    <nav className="no-print" style={{ background: '#fff', borderBottom: '2px solid #c6e6d3', padding: '10px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`tab ${isActive ? 'active' : ''}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
