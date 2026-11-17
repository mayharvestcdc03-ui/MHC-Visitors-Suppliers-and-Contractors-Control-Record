'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '../../components/Header';
import { GatePassCard } from '../../components/GatePassCard';

function GatePassContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const [visitor, setVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetch(`/api/visitors/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVisitor(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <section className="panel active" style={{ maxWidth: 1200, margin: '20px auto', padding: '0 16px' }}>
      <div className="card">
        <h2 className="no-print" style={{ color: '#18794e', marginBottom: 16 }}>Gate Pass Verification</h2>

        {loading && <div className="notice">Kinakarga ang Gate Pass...</div>}

        {!loading && !visitor && (
          <div className="notice">
            Walang napiling gate pass. Pumunta sa <a href="/records">Monitoring Records</a> o <a href="/guard">Security Approval / Guard</a> at pumili ng na-isyu na pass.
          </div>
        )}

        {visitor && (
          <div style={{ marginTop: 10 }}>
            <GatePassCard visitor={visitor} />
          </div>
        )}
      </div>
    </section>
  );
}

export default function GatePassPage() {
  return (
    <div>
      <Navigation activeTab="pass" />
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: '#fff' }}>Kinakarga...</div>}>
        <GatePassContent />
      </Suspense>
    </div>
  );
}
