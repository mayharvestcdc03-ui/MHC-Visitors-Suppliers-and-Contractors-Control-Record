'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navigation } from '../../components/Header';
import { getVisitorTheme } from '../../lib/utils';

const RETENTION_DAYS = 30;

function fmt(v: string | null | undefined) {
  if (!v) return '—';
  try {
    const d = new Date(v);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
}

function statusClass(s: string) {
  if (s.includes('Approved') || s === 'Entered') return 'verified';
  if (s === 'Rejected') return 'expired';
  return 'pending';
}

/** RA 10173 — Mask ID number, show only first 2 and last 2 chars */
function maskIdNumber(idNumber: string): string {
  if (!idNumber || idNumber.length <= 4) return '****';
  const start = idNumber.slice(0, 2);
  const end = idNumber.slice(-2);
  const masked = '•'.repeat(Math.max(4, idNumber.length - 4));
  return `${start}${masked}${end}`;
}

/** Returns days remaining before ID photo is purged */
function retentionInfo(registeredAt: string): { daysLeft: number; label: string; color: string } {
  const reg = new Date(registeredAt);
  const purgeDate = new Date(reg);
  purgeDate.setDate(purgeDate.getDate() + RETENTION_DAYS);
  const now = new Date();
  const daysLeft = Math.ceil((purgeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return { daysLeft: 0, label: 'ID purged', color: '#888' };
  if (daysLeft <= 5) return { daysLeft, label: `Purge in ${daysLeft}d`, color: '#c0392b' };
  if (daysLeft <= 10) return { daysLeft, label: `Purge in ${daysLeft}d`, color: '#e67e22' };
  return { daysLeft, label: `ID kept ${daysLeft}d`, color: '#166534' };
}

export default function RecordsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/visitors');
    const data = await res.json();
    if (data.success) setVisitors(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  const getStatus = (r: any) => r?.status || 'Pending ID Verification';

  const filtered = visitors.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || [r.fullName, r.company, r.idNumber, r.passCode, r.id, r.plate, r.visitorType].join(' ').toLowerCase().includes(q);
    const matchStatus = !statusFilter || getStatus(r) === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    // RA 10173 — Export does NOT include idNumber in full; masked version only
    const cols = ['id', 'registeredAt', 'visitorType', 'fullName', 'idType', 'company', 'contact', 'personToVisit', 'purpose', 'area', 'plate', 'visitDate', 'expectedTime', 'notes', 'idFileName', 'status', 'passCode', 'verifiedBy', 'verifiedAt', 'timeIn', 'timeOut', 'passUsed'];
    const csv = [
      cols.join(','),
      ...visitors.map(r => cols.map(k => {
        let val = (r as any)[k] ?? '';
        // Mask ID number in export
        if (k === 'idNumber') val = maskIdNumber(String(val));
        return '"' + String(val).replace(/"/g, '""') + '"';
      }).join(','))
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `MHC_visitor_records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const handlePurge = async () => {
    if (!confirm('Run RA 10173 data retention purge? This will permanently delete uploaded ID photos older than 30 days while keeping visitor logs.')) return;
    try {
      const res = await fetch('/api/purge', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchVisitors();
      } else {
        alert(data.error || 'Purge failed.');
      }
    } catch {
      alert('Failed to connect to purge service.');
    }
  };

  return (
    <div>
      <Navigation activeTab="records" />
      <section className="panel active" style={{ maxWidth: 1250, margin: '20px auto', padding: '0 16px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', color: '#18794e' }}>Visitor Monitoring Records</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#4b6354' }}>
                Opisyal na talaan ng lahat ng nag-register, na-verify, pumasok (Time In), at lumabas (Time Out).
              </p>
            </div>

            {/* Quick Action: PDF Download & Print */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href="/records/report"
                style={{
                  background: '#18794e',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(24, 121, 78, 0.25)',
                }}
              >
                📄 I-download / I-print ang PDF Summary (May Entry &amp; Exit) &rarr;
              </Link>
            </div>
          </div>

          {/* RA 10173 DPA Notice */}
          <div className="notice" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', marginBottom: 14, fontSize: 13 }}>
            🔒 <b>RA 10173 Data Privacy:</b> Ang mga ID number ay protektado at naka-mask. Ang mga litrato ng ID ay awtomatikong binubura makalipas ang {RETENTION_DAYS} araw alinsunod sa NPC privacy policy.
          </div>

          <div className="grid two">
            <div>
              <label>Maghanap (Pangalan, Kumpanya, Plaka, Pass Code, o Uri)</label>
              <input placeholder="Type to search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div>
              <label>I-filter ayon sa Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Lahat ng Status</option>
                <option value="Pending ID Verification">Pending ID Verification</option>
                <option value="Approved - Pass Issued">Approved - Pass Issued</option>
                <option value="Entered">Entered (Pumasok)</option>
                <option value="Used / Checked Out">Used / Checked Out (Lumabas)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="tablewrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr style={{ background: '#0e3d24', color: '#fff' }}>
                  <th style={{ color: '#fff' }}>Petsa ng Rehistro</th>
                  <th style={{ color: '#fff' }}>Pangalan ng Bisita</th>
                  <th style={{ color: '#fff' }}>Uri</th>
                  <th style={{ color: '#fff' }}>Kumpanya / Sasakyan</th>
                  <th style={{ color: '#fff' }}>Bibisitahin / Lugar</th>
                  <th style={{ color: '#fff' }}>Pass Code</th>
                  <th style={{ color: '#fff' }}>Status</th>
                  <th style={{ color: '#fff', background: '#166534' }}>Time In (Pumasok)</th>
                  <th style={{ color: '#fff', background: '#92400e' }}>Time Out (Lumabas)</th>
                  <th style={{ color: '#fff' }}>Aksyon</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>Kinakarga...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>Walang nakitang talaan.</td></tr>
                ) : filtered.map(r => {
                  const ret = retentionInfo(r.registeredAt);
                  const theme = getVisitorTheme(r.visitorType);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        <div>{r.visitDate}</div>
                        <div style={{ color: '#64748b' }}>{r.expectedTime}</div>
                      </td>
                      <td>
                        <b>{r.fullName}</b>
                        <div className="muted" style={{ fontSize: 11 }}>{r.idType} ({maskIdNumber(r.idNumber)})</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            background: theme.color,
                            color: theme.badgeText,
                          }}
                        >
                          {r.visitorType}
                        </span>
                      </td>
                      <td>
                        <div>{r.company || '—'}</div>
                        {r.plate && <div style={{ fontSize: 11, color: '#166534', fontWeight: 700 }}>🚛 {r.plate}</div>}
                      </td>
                      <td>
                        <div>{r.personToVisit || 'N/A - Delivery / Pick-up'}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{r.area}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0e3d24' }}>
                        {r.passCode || '—'}
                      </td>
                      <td>
                        <span className={`status ${statusClass(getStatus(r))}`} style={{ fontSize: 12 }}>
                          {getStatus(r)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: r.timeIn ? '#166534' : '#94a3b8', fontSize: 12 }}>
                        {fmt(r.timeIn)}
                      </td>
                      <td style={{ fontWeight: 700, color: r.timeOut ? '#92400e' : '#94a3b8', fontSize: 12 }}>
                        {fmt(r.timeOut)}
                      </td>
                      <td>
                        {r.passCode && (
                          <Link href={`/pass?id=${r.id}`} style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '4px 10px', fontSize: 11, background: '#18794e' }}>
                              Pass
                            </button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/records/report" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#18794e', color: '#fff' }}>
                📄 PDF Summary Report
              </button>
            </Link>
            <button className="secondary" onClick={exportCSV}>
              📊 Export CSV
            </button>
            <button className="secondary" onClick={fetchVisitors}>
              🔄 Refresh
            </button>
            <button className="secondary" style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fee2e2' }} onClick={handlePurge}>
              🗑 Run DPA Auto-Purge (&gt;30d)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
