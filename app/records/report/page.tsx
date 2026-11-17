'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getVisitorTheme } from '../../../lib/utils';

function ReportContent() {
  const params = useSearchParams();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const fetchReport = useCallback(async (dateFilter: string) => {
    setLoading(true);
    try {
      const url = dateFilter ? `/api/visitors?date=${dateFilter}` : '/api/visitors';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVisitors(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const qDate = params.get('date') || '';
    setSelectedDate(qDate);
    fetchReport(qDate);
  }, [params, fetchReport]);

  const handleDateChange = (val: string) => {
    setSelectedDate(val);
    fetchReport(val);
  };

  // Metrics
  const totalRegistered = visitors.length;
  const totalEntered = visitors.filter(v => v.timeIn).length;
  const totalExited = visitors.filter(v => v.timeOut).length;
  const currentlyInside = visitors.filter(v => v.timeIn && !v.timeOut).length;

  const fmtTime = (ts: any) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return String(ts);
    }
  };

  const fmtDate = (ts: any) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(ts);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 16px' }}>
      {/* Top Action Bar (No-Print) */}
      <div
        className="no-print"
        style={{
          maxWidth: 1200,
          margin: '0 auto 20px',
          background: '#ffffff',
          borderRadius: 10,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #c6e6d3',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/records"
            style={{
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #86efac',
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            &larr; Bumalik sa Records
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#0e3d24', margin: 0 }}>Petsa ng Report:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 13, width: 160 }}
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => handleDateChange('')}
                style={{ background: '#e2e8f0', color: '#334155', padding: '6px 10px', fontSize: 12, borderRadius: 6 }}
              >
                Ipakita Lahat
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: '#18794e',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(24, 121, 78, 0.3)',
            }}
          >
            🖨️ I-save bilang PDF / I-print
          </button>
        </div>
      </div>

      {/* Official Report Document (Printable Sheet) */}
      <div
        id="officialReportSheet"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 12,
          padding: '32px 36px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #d1d5db',
        }}
      >
        {/* Header with Official Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #18794e', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/mhc-logo.png" alt="May Harvest Corporation" style={{ width: 60, height: 60, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0e3d24', letterSpacing: 0.5 }}>
                MAY HARVEST CORPORATION
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#18794e', letterSpacing: 1, textTransform: 'uppercase' }}>
                VISITOR, SUPPLIER &amp; TRUCKER MONITORING LOG
              </div>
              <div style={{ fontSize: 12, color: '#4b6354' }}>
                Security Gate Control • Entry &amp; Exit Record • RA 10173 Compliant
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: 12, color: '#4b5563' }}>
            <div style={{ fontWeight: 800, color: '#0e3d24', fontSize: 13 }}>DOC REF: MHC-SEC-LOG-01</div>
            <div>Petsa ng Log: <b>{selectedDate ? selectedDate : 'Lahat ng Petsa'}</b></div>
            <div>Oras ng Pag-generate: <b>{new Date().toLocaleString()}</b></div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Kabuuang Rehistro</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0e3d24', marginTop: 2 }}>{totalRegistered}</div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Pumasok (Time In)</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1e3a8a', marginTop: 2 }}>{totalEntered}</div>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Lumabas (Time Out)</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#78350f', marginTop: 2 }}>{totalExited}</div>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Nasa Loob Pa</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#064e3b', marginTop: 2 }}>{currentlyInside}</div>
          </div>
        </div>

        {/* Detailed Visitors Table */}
        <div style={{ overflowX: 'auto', marginBottom: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#0e3d24', color: '#ffffff', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 35 }}>#</th>
                <th style={{ padding: '10px 8px' }}>Oras ng Reg.</th>
                <th style={{ padding: '10px 8px' }}>Pangalan ng Bisita</th>
                <th style={{ padding: '10px 8px' }}>Uri</th>
                <th style={{ padding: '10px 8px' }}>Kumpanya / Sasakyan</th>
                <th style={{ padding: '10px 8px' }}>Bibisitahin</th>
                <th style={{ padding: '10px 8px' }}>Lugar at Layunin</th>
                <th style={{ padding: '10px 8px', background: '#166534', color: '#fff', textAlign: 'center' }}>TIME IN (Entry)</th>
                <th style={{ padding: '10px 8px', background: '#92400e', color: '#fff', textAlign: 'center' }}>TIME OUT (Exit)</th>
                <th style={{ padding: '10px 8px' }}>Pass Code</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    {loading ? 'Kinakarga ang ulat...' : 'Walang naitalang bisita para sa petsang ito.'}
                  </td>
                </tr>
              ) : (
                visitors.map((v, i) => {
                  const theme = getVisitorTheme(v.visitorType);
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{v.visitDate}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{v.expectedTime || ''}</div>
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.fullName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{v.idType}</div>
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 8, fontSize: 10.5, fontWeight: 700, background: theme.color, color: theme.badgeText }}>
                          {v.visitorType}
                        </span>
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ fontWeight: 600 }}>{v.company || '—'}</div>
                        {v.plate && <div style={{ fontSize: 11, color: '#166534', fontWeight: 700 }}>🚛 {v.plate}</div>}
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        {v.personToVisit || 'N/A - Delivery / Pick-up'}
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ fontWeight: 600 }}>{v.area}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{v.purpose}</div>
                      </td>
                      {/* TIME IN */}
                      <td style={{ padding: '8px 8px', textAlign: 'center', background: v.timeIn ? '#f0fdf4' : 'transparent', fontWeight: 800, color: v.timeIn ? '#166534' : '#94a3b8' }}>
                        {v.timeIn ? (
                          <div>
                            <div>{fmtTime(v.timeIn)}</div>
                            <div style={{ fontSize: 10, color: '#15803d', fontWeight: 500 }}>{fmtDate(v.timeIn)}</div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      {/* TIME OUT */}
                      <td style={{ padding: '8px 8px', textAlign: 'center', background: v.timeOut ? '#fef3c7' : 'transparent', fontWeight: 800, color: v.timeOut ? '#92400e' : '#94a3b8' }}>
                        {v.timeOut ? (
                          <div>
                            <div>{fmtTime(v.timeOut)}</div>
                            <div style={{ fontSize: 10, color: '#b45309', fontWeight: 500 }}>{fmtDate(v.timeOut)}</div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '8px 8px', fontFamily: 'monospace', fontWeight: 800, color: '#0e3d24' }}>
                        {v.passCode || '—'}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: v.status?.includes('Approved') || v.status === 'Entered' ? '#16a34a' : '#64748b' }}>
                          {v.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sign-off / Authorization Block */}
        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 24,
            textAlign: 'center',
            fontSize: 12,
            color: '#334155',
          }}
        >
          <div>
            <div style={{ borderBottom: '1.5px solid #0e3d24', paddingBottom: 40, marginBottom: 8 }}></div>
            <div style={{ fontWeight: 800, color: '#0e3d24' }}>SECURITY GUARD ON-DUTY</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Prepared by / Verified at Gate</div>
          </div>

          <div>
            <div style={{ borderBottom: '1.5px solid #0e3d24', paddingBottom: 40, marginBottom: 8 }}></div>
            <div style={{ fontWeight: 800, color: '#0e3d24' }}>SECURITY SUPERVISOR / OIC</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Reviewed &amp; Checked</div>
          </div>

          <div>
            <div style={{ borderBottom: '1.5px solid #0e3d24', paddingBottom: 40, marginBottom: 8 }}></div>
            <div style={{ fontWeight: 800, color: '#0e3d24' }}>HR &amp; ADMIN / MANAGEMENT</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Noted &amp; Filed for Audit Compliance</div>
          </div>
        </div>

        {/* Compliance Footer */}
        <div style={{ marginTop: 32, borderTop: '1px solid #e2e8f0', paddingTop: 12, fontSize: 11, color: '#64748b', textAlign: 'center' }}>
          This document is an official record of May Harvest Corporation under RA 10173 (Philippine Data Privacy Act of 2012) and GMP Biosecurity protocols.
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Kinakarga ang ulat...</div>}>
      <ReportContent />
    </Suspense>
  );
}
