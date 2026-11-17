'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '../../components/Header';
import { getVisitorTheme } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

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

  const getStatus = (r: any) => r?.status || 'Pending ID Verification';

  const theme = visitor ? getVisitorTheme(visitor.visitorType) : getVisitorTheme('');

  return (
    <section className="panel active">
      <div className="card">
        <h2 className="no-print">Gate Pass</h2>

        {loading && <div className="notice">Loading gate pass...</div>}

        {!loading && !visitor && (
          <div className="notice">
            No gate pass selected. Open <a href="/records">Monitoring Records</a> or <a href="/guard">Security Approval / Guard</a> and select an issued pass.
          </div>
        )}

        {visitor && (
          <div
            id="passCard"
            className="print-only-card"
            style={{
              maxWidth: 650,
              border: `2.5px solid ${theme.color}`,
              borderRadius: 12,
              padding: 24,
              marginTop: 15,
              background: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            {/* Pass Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                borderBottom: `2px solid ${theme.color}`,
                paddingBottom: 12,
              }}
            >
              {/* MHC Logo + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* MHC 4-Leaf Clover Logo */}
                  <svg viewBox="0 0 100 100" width="46" height="46">
                    <circle cx="36" cy="36" r="22" fill="#18794e" />
                    <circle cx="64" cy="36" r="22" fill="#18794e" />
                    <circle cx="36" cy="64" r="22" fill="#18794e" />
                    <circle cx="64" cy="64" r="22" fill="#18794e" />
                    <path d="M 50 50 Q 50 88 44 94" stroke="#18794e" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <text x="36" y="42" fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">M</text>
                    <text x="50" y="55" fill="#facc15" fontSize="11" fontWeight="900" textAnchor="middle">★</text>
                    <text x="64" y="42" fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">H</text>
                    <text x="50" y="72" fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">C</text>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#17212b', letterSpacing: 0.5 }}>
                    MAY HARVEST CORPORATION
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 0.5 }}>
                    VISITOR / SUPPLIER / CONTRACTOR
                  </div>
                </div>
              </div>

              {/* Right Side Control Header */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#17212b', letterSpacing: 0.5 }}>
                  ONE-TIME GATE PASS
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: 0.5 }}>
                  SECURITY CONTROL
                </div>
              </div>
            </div>

            {/* Visitor Type Badge */}
            <div style={{ marginTop: 14 }}>
              <span
                style={{
                  display: 'inline-block',
                  background: theme.color,
                  color: theme.badgeText,
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {visitor.visitorType}
              </span>
            </div>

            {/* Pass Code */}
            <div
              style={{
                fontSize: 29,
                fontWeight: 900,
                letterSpacing: 2.5,
                color: theme.color,
                margin: '12px 0 14px',
                fontFamily: 'monospace, Arial, sans-serif',
              }}
            >
              {visitor.passCode || 'NOT ISSUED'}
            </div>

            {/* Validity Box */}
            <div
              style={{
                border: `1.5px solid ${theme.color}`,
                background: theme.bgLight,
                borderRadius: 8,
                padding: '12px 16px',
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: theme.color,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}
              >
                GATE PASS VALIDITY
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: theme.color,
                  marginBottom: 3,
                  letterSpacing: 0.5,
                }}
              >
                VALID FOR THE DAY OF THE VISIT ONLY
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: theme.color,
                  letterSpacing: 0.5,
                }}
              >
                VALID ON: {visitor.visitDate} ONLY
              </div>
            </div>

            {/* Pass Details Grid */}
            <div className="grid two" style={{ gap: '10px 20px' }}>
              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Visitor Name
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.fullName}
                </div>
              </div>
              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Company
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.company}
                </div>
              </div>

              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Visit Date
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.visitDate} {visitor.expectedTime || ''}
                </div>
              </div>
              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Purpose
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.purpose}
                </div>
              </div>

              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Authorized Area
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.area}
                </div>
              </div>
              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Person to Visit
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.personToVisit}
                </div>
              </div>

              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Valid ID Checked By
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {visitor.verifiedBy || '—'}
                </div>
              </div>
              <div>
                <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Status
                </label>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
                  {getStatus(visitor)}
                </div>
              </div>
            </div>

            <hr style={{ borderColor: theme.color, opacity: 0.35, margin: '16px 0 12px' }} />

            {/* Security Instructions */}
            <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: '0 0 14px', color: '#17212b' }}>
              <b>Security instructions:</b> This pass is valid only on the approved visit date shown above and for one entry only. It automatically becomes invalid after that date. Present it to the guard. Follow MHC security, GMP, PPE and visitor rules. Access to restricted/production areas requires separate authorization and an MHC guide.
            </p>

            <hr style={{ borderColor: '#e2e8f0', margin: '0 0 14px' }} />

            {/* QR Code Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ padding: 6, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
                <QRCodeSVG
                  value={`MHC-PASS:${visitor.passCode || visitor.id}|${visitor.fullName}|${visitor.visitDate}|${visitor.area}`}
                  size={100}
                  level="M"
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#17212b', marginBottom: 4 }}>
                  Scan for Visitor Do&apos;s and Don&apos;ts
                </div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4 }}>
                  Scan this QR code with a phone camera to read MHC visitor rules. Follow all current site instructions.
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#777', marginTop: 14 }}>
              Keep this pass with the visitor record. Do not reuse or transfer it.
            </div>
          </div>
        )}

        {visitor && (
          <div className="actions no-print" style={{ marginTop: 20 }}>
            <button onClick={() => window.print()} style={{ background: '#245b82' }}>
              Print Gate Pass
            </button>
            <a href="/records">
              <button className="secondary">Back to Records</button>
            </a>
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
      <Suspense fallback={<div className="card"><div className="notice">Loading gate pass...</div></div>}>
        <GatePassContent />
      </Suspense>
    </div>
  );
}
