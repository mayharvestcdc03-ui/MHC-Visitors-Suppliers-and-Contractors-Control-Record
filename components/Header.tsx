import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-[#17324d] text-white py-4 px-6 shadow-md no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow flex-shrink-0">
            {/* MHC Brand Badge */}
            <span className="font-extrabold text-[#18794e] text-xl tracking-tighter">MHC</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
              May Harvest Corporation
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Visitor, Supplier & Contractor Monitoring • Enterprise Gate Pass System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live & Compliant (RA 10173)
          </span>
        </div>
      </div>
    </header>
  );
}

export function Navigation({ activeTab }: { activeTab?: string }) {
  const tabs = [
    { id: 'register', label: 'Register Visitor', href: '/' },
    { id: 'guard', label: 'Guard & ID Verification', href: '/guard' },
    { id: 'records', label: 'Monitoring Records', href: '/records' },
    { id: 'pass', label: 'Gate Pass', href: '/pass' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-2.5 shadow-sm no-print sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#17324d] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
