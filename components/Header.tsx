'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Language, translations } from '../lib/i18n';

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lang, setLang] = useState<Language>('tl');

  useEffect(() => {
    const saved = (localStorage.getItem('mhc_lang') as Language) || 'tl';
    setLang(saved);

    const onLangChange = (e: any) => {
      if (e.detail?.lang) setLang(e.detail.lang);
    };
    window.addEventListener('mhc_lang_changed', onLangChange);
    return () => window.removeEventListener('mhc_lang_changed', onLangChange);
  }, []);

  const switchLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('mhc_lang', newLang);
    window.dispatchEvent(new CustomEvent('mhc_lang_changed', { detail: { lang: newLang } }));
  };

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
      const datePart = now.toLocaleDateString(lang === 'tl' ? 'fil-PH' : 'en-US', optionsDate);
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
  }, [lang]);

  return (
    <header className="no-print" style={{ background: '#0e3d24', color: '#fff', padding: '14px 24px', borderBottom: '3px solid #16a34a' }}>
      <div style={{ maxWidth: 1250, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, background: '#fff', borderRadius: 10, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            <img src="/mhc-logo.png" alt="May Harvest Corporation" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              May Harvest Corporation
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#a7f3d0', fontWeight: 500 }}>
              {lang === 'tl' ? 'Pagsusuri ng Bisita, Supplier at Trucker • One-Time Gate Pass' : 'Visitor, Supplier & Trucker Monitoring • One-Time Gate Pass'}
            </p>
          </div>
        </div>

        {/* Upper Right: Language Switcher, Live Running Clock & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Language Switcher Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: '#072415',
                padding: '3px',
                borderRadius: 8,
                border: '1.5px solid #16a34a',
              }}
            >
              <button
                type="button"
                onClick={() => switchLang('tl')}
                style={{
                  background: lang === 'tl' ? '#18794e' : 'transparent',
                  color: lang === 'tl' ? '#ffffff' : '#86efac',
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🇵🇭 Tagalog
              </button>
              <button
                type="button"
                onClick={() => switchLang('en')}
                style={{
                  background: lang === 'en' ? '#18794e' : 'transparent',
                  color: lang === 'en' ? '#ffffff' : '#86efac',
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🇺🇸 English
              </button>
            </div>

            {currentTime ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: '#166534',
                  color: '#ecfdf5',
                  border: '1px solid #22c55e',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  fontFamily: 'monospace, Arial, sans-serif',
                }}
              >
                <span style={{ fontSize: 13 }}>🕒</span>
                <span>{currentTime}</span>
              </div>
            ) : null}
          </div>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', border: '1px solid rgba(134, 239, 172, 0.3)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}></span>
            Online &amp; RA 10173 Compliant
          </span>
        </div>
      </div>
    </header>
  );
}

export function Navigation({ activeTab }: { activeTab?: string }) {
  const [lang, setLang] = useState<Language>('tl');

  useEffect(() => {
    const saved = (localStorage.getItem('mhc_lang') as Language) || 'tl';
    setLang(saved);

    const onLangChange = (e: any) => {
      if (e.detail?.lang) setLang(e.detail.lang);
    };
    window.addEventListener('mhc_lang_changed', onLangChange);
    return () => window.removeEventListener('mhc_lang_changed', onLangChange);
  }, []);

  const t = translations[lang];

  const tabs = [
    { id: 'register', label: t.navRegister, href: '/' },
    { id: 'qr', label: t.navQr, href: '/qr-register' },
    { id: 'records', label: t.navRecords, href: '/records' },
    { id: 'guard', label: t.navGuard, href: '/guard' },
    { id: 'pass', label: t.navPass, href: '/pass' },
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
