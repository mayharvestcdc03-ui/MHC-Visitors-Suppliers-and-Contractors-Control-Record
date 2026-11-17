import Link from 'next/link';

export function Header() {
  return (
    <header className="no-print">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, background: '#fff', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <img src="/mhc-logo.png" alt="May Harvest Corporation" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#fff' }}>May Harvest Corporation</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#dce7f1' }}>Visitor, Supplier &amp; Contractor Monitoring • One-Time Gate Pass</p>
          </div>
        </div>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(24, 121, 78, 0.4)', color: '#a7f3d0', border: '1px solid rgba(167, 243, 208, 0.3)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }}></span>
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
    { id: 'records', label: 'Monitoring Records', href: '/records' },
    { id: 'guard', label: 'Security Approval / Guard', href: '/guard' },
    { id: 'pass', label: 'Gate Pass', href: '/pass' },
  ];

  return (
    <nav className="no-print" style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '10px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
