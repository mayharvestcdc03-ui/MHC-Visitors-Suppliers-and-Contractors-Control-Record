'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Header';

const RETENTION_DAYS = 30;

function fmt(v: string | null | undefined) {
  return v ? new Date(v).toLocaleString() : '—';
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
  return { daysLeft, label: `ID kept ${daysLeft}d`, color: '#27ae60' };
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
    const matchSearch = !q || [r.fullName, r.company, r.idNumber, r.passCode, r.id].join(' ').toLowerCase().includes(q);
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
    a.download = 'MHC_visitor_records.csv';
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
      <section className="panel active">
        <div className="card">
          <h2>Visitor Monitoring Records</h2>
          {/* RA 10173 DPA Notice */}
          <div className="notice" style={{ background: '#eaf4fb', borderColor: '#3498db', color: '#1a5276', marginBottom: 12, fontSize: 13 }}>
            🔒 <b>RA 10173 Data Privacy:</b> ID numbers are masked for display. Uploaded ID photos are automatically purged after {RETENTION_DAYS} days per NPC retention policy.
            <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.8 }}>CSV export excludes full ID numbers.</span>
          </div>
          <p className="muted">Search locally saved registrations. Use ID Verification / Guard to approve an ID and record entry/exit.</p>

          <div className="grid two">
            <div>
              <label>Search name, company, pass code, or ID number</label>
              <input placeholder="Type to search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div>
              <label>Filter status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option>Pending ID Verification</option>
                <option>Approved - Pass Issued</option>
                <option>Entered</option>
                <option>Used / Checked Out</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          <div className="tablewrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Registered</th>
                  <th>Visitor</th>
                  <th>Company / Type</th>
                  <th>Purpose / Area</th>
                  <th>ID <span style={{ fontWeight: 400, fontSize: 11, color: '#888' }}>(masked)</span></th>
                  <th>ID Retention</th>
                  <th>Pass Code</th>
                  <th>Status</th>
                  <th>Entry / Exit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10}>No matching registrations.</td></tr>
                ) : filtered.map(r => {
                  const ret = r.registeredAt ? retentionInfo(r.registeredAt) : null;
                  const isPurged = !!r.idPurgedAt;
                  return (
                    <tr key={r.id}>
                      <td>{fmt(r.registeredAt)}</td>
                      <td><b>{r.fullName}</b><br />{r.visitorType}</td>
                      <td>{r.company}</td>
                      <td>{r.purpose}<br />{r.area}</td>
                      <td>
                        {r.idType}<br />
                        <span title="ID number masked per RA 10173" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                          {maskIdNumber(r.idNumber || '')}
                        </span><br />
                        <span className="muted">{isPurged ? '🗑 ID file purged' : (r.idFileName || 'No file')}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {ret && !isPurged ? (
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: ret.color,
                            background: ret.color + '18', borderRadius: 4,
                            padding: '2px 6px', whiteSpace: 'nowrap'
                          }}>
                            {ret.label}
                          </span>
                        ) : isPurged ? (
                          <span style={{ fontSize: 11, color: '#888' }}>🗑 Purged<br />{fmt(r.idPurgedAt)}</span>
                        ) : '—'}
                      </td>
                      <td>{r.passCode || '—'}</td>
                      <td>
                        <span className={`status ${statusClass(getStatus(r))}`}>{getStatus(r)}</span>
                      </td>
                      <td>In: {fmt(r.timeIn)}<br />Out: {fmt(r.timeOut)}</td>
                      <td>
                        <a href={`/guard?select=${r.id}`}>
                          <button className="secondary">Review</button>
                        </a>
                        {r.passCode && (
                          <> <a href={`/pass?id=${r.id}`}><button>View Pass</button></a></>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="actions">
            <button className="secondary" onClick={exportCSV}>Export CSV (masked IDs)</button>
            <button className="secondary" onClick={fetchVisitors}>Refresh</button>
            <button className="secondary" style={{ color: '#c0392b', borderColor: '#e74c3c' }} onClick={handlePurge}>
              🗑 Run DPA Auto-Purge (&gt;30d)
            </button>
          </div>
          <p className="muted">CSV export includes masked ID numbers only. Uploaded ID photo files are never included in exports (RA 10173).</p>
        </div>
      </section>
    </div>
  );
}
