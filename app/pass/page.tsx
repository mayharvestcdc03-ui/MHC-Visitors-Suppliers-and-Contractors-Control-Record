'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '../../components/Header';

function GatePassContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const [visitor, setVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetch(`/api/visitors/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVisitor(d.data); setLoading(false); });
  }, [id]);

  const getStatus = (r: any) => r?.status || 'Pending ID Verification';

  return (
    <section className="panel active">
      <div className="card">
        <h2 className="no-print">Gate Pass</h2>

        {loading && <div className="notice">Loading...</div>}

        {!loading && !visitor && (
          <div className="notice">No gate pass selected. Open <a href="/records">Monitoring Records</a> or <a href="/guard">ID Verification / Guard</a> and select an issued pass.</div>
        )}

        {visitor && (
          <div id="passCard" className="print-only-card" style={{ maxWidth: 650, border: '2px dashed #17324d', padding: 24, marginTop: 15, background: 'white' }}>
            {/* Pass Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '2px solid #17324d', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 60, height: 60, background: '#17324d', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: 18, letterSpacing: -1 }}>MHC</span>
                </div>
                <div>
                  <b>MAY HARVEST CORPORATION</b>
                  <div style={{ fontSize: 12 }}>VISITOR / SUPPLIER / CONTRACTOR</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b>ONE-TIME GATE PASS</b>
                <div style={{ fontSize: 12 }}>SECURITY CONTROL</div>
              </div>
            </div>

            {/* Pass Code */}
            <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: 2, color: '#17324d', margin: '16px 0' }}>
              {visitor.passCode || 'NOT ISSUED'}
            </div>

            {/* Pass Details */}
            <div className="grid two">
              <div><label>Visitor Name</label><div>{visitor.fullName}</div></div>
              <div><label>Company</label><div>{visitor.company}</div></div>
              <div><label>Visit Date</label><div>{visitor.visitDate} {visitor.expectedTime}</div></div>
              <div><label>Purpose</label><div>{visitor.purpose}</div></div>
              <div><label>Authorized Area</label><div>{visitor.area}</div></div>
              <div><label>Person to Visit</label><div>{visitor.personToVisit}</div></div>
              <div><label>Valid ID Checked By</label><div>{visitor.verifiedBy || '—'}</div></div>
              <div><label>Status</label><div>{getStatus(visitor)}</div></div>
            </div>

            <hr />
            <p>
              <b>Security instructions:</b> This pass is valid for one entry only on the stated date. Present it to the guard. Follow MHC security, GMP, PPE and visitor rules. Access to restricted/production areas requires separate authorization and an MHC guide.
            </p>

            <div style={{ fontSize: 12, marginTop: 10 }}>Keep this pass with the visitor record. Do not reuse or transfer it.</div>
          </div>
        )}

        {visitor && (
          <div className="actions no-print">
            <button onClick={() => window.print()}>Print Gate Pass</button>
            <a href="/records"><button className="secondary">Back to Records</button></a>
          </div>
        )}
      </div>
    </section>
  );
}

export default function PassPage() {
  return (
    <div>
      <Navigation activeTab="pass" />
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <GatePassContent />
      </Suspense>
    </div>
  );
}
