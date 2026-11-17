'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '../../components/Header';
import { getVisitorTheme } from '../../lib/utils';

function GuardContent() {
  const params = useSearchParams();
  const [guardName, setGuardName] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'APPROVED' | 'ENTERED' | 'ALL'>('PENDING');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info'; passCode?: string; visitorId?: string } | null>(null);

  // Load guard name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mhc_guard_name');
    if (saved) setGuardName(saved);
  }, []);

  const handleGuardNameChange = (val: string) => {
    setGuardName(val);
    localStorage.setItem('mhc_guard_name', val);
  };

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visitors');
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
    fetchVisitors();
  }, [fetchVisitors]);

  // Auto-select visitor from URL ?select=<id>
  useEffect(() => {
    const selectId = params.get('select');
    if (selectId && visitors.length > 0) {
      const found = visitors.find(v => v.id === selectId);
      if (found) setSelectedVisitor(found);
    }
  }, [params, visitors]);

  // Deduplicate visitors: siguraduhin na bawat bisita ay ISANG ENTRY LAMANG (walang duplicate sa listahan)
  const deduplicatedVisitors = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const v of visitors) {
      if (!v || !v.id) continue;
      // Key batay sa Pangalan + Petsa + Uri ng Bisita upang isa lamang ang lumabas
      const key = `${(v.fullName || '').trim().toLowerCase()}_${v.visitDate}_${(v.visitorType || '').trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(v);
    }
    return result;
  }, [visitors]);

  // Filter visitors gamit ang deduplicated list
  const pendingVisitors = useMemo(() => {
    return deduplicatedVisitors.filter(v => (v.status || '').toLowerCase().includes('pending'));
  }, [deduplicatedVisitors]);

  const approvedVisitors = useMemo(() => {
    return deduplicatedVisitors.filter(v => (v.status || '').toLowerCase().includes('approved') && !v.timeIn);
  }, [deduplicatedVisitors]);

  const enteredVisitors = useMemo(() => {
    return deduplicatedVisitors.filter(v => (v.status || '').toLowerCase() === 'entered' && !v.timeOut);
  }, [deduplicatedVisitors]);

  const filteredVisitors = useMemo(() => {
    let list = deduplicatedVisitors;
    if (activeFilter === 'PENDING') {
      list = pendingVisitors;
    } else if (activeFilter === 'APPROVED') {
      list = approvedVisitors;
    } else if (activeFilter === 'ENTERED') {
      list = enteredVisitors;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.fullName || '').toLowerCase().includes(q) ||
        (v.company || '').toLowerCase().includes(q) ||
        (v.plate || '').toLowerCase().includes(q) ||
        (v.visitorType || '').toLowerCase().includes(q) ||
        (v.passCode || '').toLowerCase().includes(q) ||
        (v.purpose || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [deduplicatedVisitors, activeFilter, pendingVisitors, approvedVisitors, enteredVisitors, search]);

  const doAction = async (visitor: any, action: string) => {
    if (actionLoadingId) return; // Pigilan ang double click habang may kasalukuyang aksyon
    if (!guardName.trim()) {
      alert('Paki-lagay muna ang iyong pangalan sa "Guard / Verifier Name" bago magpatuloy.');
      return;
    }

    const st = visitor.status || 'Pending ID Verification';

    if (action === 'approve') {
      if (st === 'Rejected') return alert('Hindi na maaaring i-approve ang rejected registration.');
    }
    if (action === 'reject') {
      if (visitor.passUsed) return alert('Nagamit na ang pass na ito.');
      if (!confirm(`Sigurado ka bang nais mong i-REJECT si ${visitor.fullName}?`)) return;
    }
    if (action === 'entry') {
      if (!visitor.passCode) return alert('Wala pang approved pass code. I-approve muna ang ID.');
      if (visitor.passUsed || visitor.timeIn) return alert('Nagamit na ang one-time pass na ito.');
    }
    if (action === 'exit') {
      if (!visitor.timeIn) return alert('Wala pang entry record si bisita.');
      if (visitor.timeOut) return alert('Naitala na ang exit ni bisita.');
    }

    setActionLoadingId(visitor.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/visitors/${visitor.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, guardName }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchVisitors();
        const updated = data.data;

        if (action === 'approve') {
          setMessage({
            text: `✅ Matagumpay na na-approve si <b>${visitor.fullName}</b>! One-Time Gate Pass Code: <b>${updated.passCode}</b>`,
            type: 'success',
            passCode: updated.passCode,
            visitorId: visitor.id,
          });
          if (selectedVisitor?.id === visitor.id) setSelectedVisitor(updated);
        } else if (action === 'reject') {
          setMessage({ text: `❌ Na-reject ang registration ni <b>${visitor.fullName}</b>.`, type: 'danger' });
          if (selectedVisitor?.id === visitor.id) setSelectedVisitor(null);
        } else if (action === 'entry') {
          setMessage({ text: `🚪 Naitala ang ENTRY ni <b>${visitor.fullName}</b>. Nagamit na ang pass.`, type: 'success' });
          if (selectedVisitor?.id === visitor.id) setSelectedVisitor(updated);
        } else if (action === 'exit') {
          setMessage({ text: `👋 Naitala ang EXIT ni <b>${visitor.fullName}</b>.`, type: 'info' });
          if (selectedVisitor?.id === visitor.id) setSelectedVisitor(updated);
        }
      } else {
        alert(data.error || 'Nabigo ang aksyon.');
      }
    } catch (err: any) {
      alert(err.message || 'Error sa pakikipag-ugnayan sa server.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="panel active" style={{ maxWidth: 1250, margin: '20px auto', padding: '0 16px' }}>
      {/* Top Banner & Verifier Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#18794e' }}>
              Security Approval &amp; Gate Pass Issuance
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              Nakalapag ang lahat ng bisita, trucker, at kontratista na naghihintay ng ID verification at gate pass approval.
            </p>
          </div>

          <div style={{ minWidth: 280 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#17324d', display: 'block', marginBottom: 4 }}>
              👮 Security Guard / Verifier Name *
            </label>
            <input
              value={guardName}
              onChange={e => handleGuardNameChange(e.target.value)}
              placeholder="e.g. Officer Reyes / Joshua Francisco"
              style={{ fontWeight: 600, borderColor: '#18794e', background: '#f0fdf4' }}
            />
          </div>
        </div>

        {/* Success / Alert Banner */}
        {message && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 8,
              border: `1px solid ${message.type === 'success' ? '#86efac' : message.type === 'danger' ? '#fca5a5' : '#93c5fd'}`,
              background: message.type === 'success' ? '#f0fdf4' : message.type === 'danger' ? '#fef2f2' : '#eff6ff',
              color: message.type === 'success' ? '#166534' : message.type === 'danger' ? '#991b1b' : '#1e40af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: message.text }} />
            {message.passCode && message.visitorId && (
              <Link
                href={`/pass?id=${message.visitorId}`}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Tingnan / I-print ang Gate Pass ({message.passCode}) &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Quick Filter Counters */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('PENDING')}
            style={{
              background: activeFilter === 'PENDING' ? '#b45309' : '#fef3c7',
              color: activeFilter === 'PENDING' ? '#fff' : '#92400e',
              border: '1px solid #f59e0b',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⏳ For Approval (Kailangan i-approve)</span>
            <span
              style={{
                background: activeFilter === 'PENDING' ? 'rgba(255,255,255,0.3)' : '#b45309',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {pendingVisitors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('APPROVED')}
            style={{
              background: activeFilter === 'APPROVED' ? '#15803d' : '#dcfce7',
              color: activeFilter === 'APPROVED' ? '#fff' : '#166534',
              border: '1px solid #22c55e',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✅ Approved / Ready for Entry</span>
            <span
              style={{
                background: activeFilter === 'APPROVED' ? 'rgba(255,255,255,0.3)' : '#15803d',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {approvedVisitors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('ENTERED')}
            style={{
              background: activeFilter === 'ENTERED' ? '#0e3d24' : '#d1fae5',
              color: activeFilter === 'ENTERED' ? '#fff' : '#064e3b',
              border: '1px solid #10b981',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🏢 Currently Inside</span>
            <span
              style={{
                background: activeFilter === 'ENTERED' ? 'rgba(255,255,255,0.3)' : '#0e3d24',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {enteredVisitors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            style={{
              background: activeFilter === 'ALL' ? '#374151' : '#f3f4f6',
              color: activeFilter === 'ALL' ? '#fff' : '#374151',
              border: '1px solid #9ca3af',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Lahat ({visitors.length})
          </button>
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Maghanap ayon sa Pangalan, Kumpanya, Plate No., o Uri ng Bisita..."
            style={{ flex: 1, padding: '8px 12px', fontSize: 14 }}
          />
          <button
            type="button"
            onClick={fetchVisitors}
            disabled={loading}
            style={{
              background: '#18794e',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Kinakarga...' : '🔄 I-refresh'}
          </button>
        </div>
      </div>

      {/* Main List Table (Nakalatag na lahat) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#17324d', fontWeight: 700 }}>
            {activeFilter === 'PENDING' && `⏳ Mga Naghihintay ng Approval (${filteredVisitors.length})`}
            {activeFilter === 'APPROVED' && `✅ Mga Approved na Gate Pass (${filteredVisitors.length})`}
            {activeFilter === 'ENTERED' && `🏢 Mga Kasalukuyang Nasa Loob (${filteredVisitors.length})`}
            {activeFilter === 'ALL' && `📋 Lahat ng Talaan (${filteredVisitors.length})`}
          </h3>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            I-click ang <b>"Approve &amp; Issue Pass"</b> para bigyan agad ng Gate Pass code ang bisita.
          </span>
        </div>

        {filteredVisitors.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
            {activeFilter === 'PENDING' ? (
              <div>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>Walang Pending for Approval!</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Lahat ng nag-register na bisita at trucker ay na-proseso na.</div>
              </div>
            ) : (
              <div>Walang nakitang talaan para sa filter na ito.</div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0e3d24' }}>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Uri / Visitor Type</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Pangalan ng Bisita</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Kumpanya / Plate No.</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Lugar at Layunin</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Person to Visit</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Petsa at Oras</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Kalusugan</th>
                  <th style={{ background: '#0e3d24', color: '#ffffff', padding: '12px 16px', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, textAlign: 'center' }}>Mga Aksyon</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((v) => {
                  const theme = getVisitorTheme(v.visitorType);
                  const isPending = (v.status || '').toLowerCase().includes('pending');
                  const isApproved = (v.status || '').toLowerCase().includes('approved') && !v.timeIn;
                  const isEntered = (v.status || '').toLowerCase() === 'entered' && !v.timeOut;
                  const isActing = actionLoadingId === v.id;

                  return (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: selectedVisitor?.id === v.id ? '#f0fdf4' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Visitor Type Badge */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            background: theme.color,
                            color: theme.badgeText,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {v.visitorType}
                        </span>
                        {v.passCode && (
                          <div style={{ marginTop: 4, fontWeight: 800, fontSize: 12, color: theme.color }}>
                            {v.passCode}
                          </div>
                        )}
                      </td>

                      {/* Full Name & Contact */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{v.fullName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {v.idType}: <span style={{ fontFamily: 'monospace' }}>{v.idNumber}</span>
                        </div>
                        {v.contact && <div style={{ fontSize: 11, color: '#64748b' }}>📞 {v.contact}</div>}
                      </td>

                      {/* Company & Vehicle Plate */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{v.company || '—'}</div>
                        {v.plate ? (
                          <div style={{ display: 'inline-block', marginTop: 3, padding: '2px 6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, fontWeight: 700, fontSize: 11, color: '#0f172a' }}>
                            🚛 {v.plate}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>Walang sasakyan</span>
                        )}
                      </td>

                      {/* Area & Purpose */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.area}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{v.purpose}</div>
                      </td>

                      {/* Person to Visit */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
                          {v.personToVisit || 'N/A - Delivery / Pick-up'}
                        </div>
                      </td>

                      {/* Visit Date & Expected Time */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{v.visitDate}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>🕒 {v.expectedTime}</div>
                      </td>

                      {/* Health Status */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        {v.hasHealthSymptoms ? (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: 11 }}>
                            ⚠️ May Sintomas
                          </span>
                        ) : (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 11 }}>
                            ✓ Cleared
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150 }}>
                          {/* Approve Button for Pending */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => doAction(v, 'approve')}
                              disabled={isActing}
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              }}
                            >
                              {isActing ? 'Pinoproseso...' : '✓ Approve & Issue Pass'}
                            </button>
                          )}

                          {/* Record Entry for Approved */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => doAction(v, 'entry')}
                              disabled={isActing}
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              🚪 Record Entry (Pumasok)
                            </button>
                          )}

                          {/* Record Exit for Entered */}
                          {isEntered && (
                            <button
                              type="button"
                              onClick={() => doAction(v, 'exit')}
                              disabled={isActing}
                              style={{
                                background: '#d97706',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              👋 Record Exit (Lumabas)
                            </button>
                          )}

                          {/* View Pass link if issued */}
                          {v.passCode && (
                            <Link
                              href={`/pass?id=${v.id}`}
                              style={{
                                background: '#f8fafc',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11,
                                fontWeight: 600,
                                textDecoration: 'none',
                                textAlign: 'center',
                              }}
                            >
                              🎫 Buksan ang Pass
                            </Link>
                          )}

                          {/* Secondary options: Review details & Reject */}
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedVisitor(v)}
                              style={{
                                background: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                flex: 1,
                              }}
                            >
                              🔍 Detalye
                            </button>

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => doAction(v, 'reject')}
                                disabled={isActing}
                                style={{
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  border: '1px solid #fca5a5',
                                  borderRadius: 4,
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                ✕ Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal / Drawer kapag pinindot ang Detalye */}
      {selectedVisitor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedVisitor(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              maxWidth: 720,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    background: getVisitorTheme(selectedVisitor.visitorType).color,
                    color: getVisitorTheme(selectedVisitor.visitorType).badgeText,
                    marginBottom: 6,
                  }}
                >
                  {selectedVisitor.visitorType}
                </span>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>{selectedVisitor.fullName}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                  {selectedVisitor.company} • {selectedVisitor.visitDate} ({selectedVisitor.expectedTime})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: '#475569' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, fontSize: 13 }}>
              <div>
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block' }}>ID TYPE &amp; NUMBER</span>
                <span style={{ fontWeight: 600 }}>{selectedVisitor.idType} — {selectedVisitor.idNumber}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block' }}>CONTACT</span>
                <span style={{ fontWeight: 600 }}>{selectedVisitor.contact || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block' }}>PURPOSE</span>
                <span style={{ fontWeight: 600 }}>{selectedVisitor.purpose}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block' }}>REQUESTED AREA</span>
                <span style={{ fontWeight: 600 }}>{selectedVisitor.area}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block' }}>PERSON TO VISIT</span>
                <span style={{ fontWeight: 600 }}>{selectedVisitor.personToVisit || 'N/A - Delivery / Pick-up'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block' }}>VEHICLE PLATE</span>
                <span style={{ fontWeight: 600 }}>{selectedVisitor.plate || 'Walang Sasakyan'}</span>
              </div>
            </div>

            {/* Health Declaration Responses */}
            <div style={{ marginTop: 16, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#334155', marginBottom: 6 }}>
                14 Health Assessment Questions
              </div>
              <div style={{ fontSize: 12, color: '#475569', maxHeight: 120, overflowY: 'auto' }}>
                {(() => {
                  try {
                    const arr = JSON.parse(selectedVisitor.healthAnswers || '[]');
                    return arr.map((ans: string, idx: number) => (
                      <span key={idx} style={{ display: 'inline-block', marginRight: 8, marginBottom: 4 }}>
                        Q{idx + 1}: <b style={{ color: ans === 'Yes' ? '#dc2626' : '#16a34a' }}>{ans}</b>
                      </span>
                    ));
                  } catch {
                    return selectedVisitor.healthAnswers;
                  }
                })()}
              </div>
            </div>

            {/* ID Document Preview if uploaded */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#334155', marginBottom: 6 }}>
                Uploaded Valid ID Document (RA 10173 Protected)
              </div>
              {selectedVisitor.idPurgedAt ? (
                <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 6, fontSize: 12, color: '#64748b' }}>
                  🗑 Ang file ng ID ay na-purge / binura na alinsunod sa Data Privacy Act (RA 10173).
                </div>
              ) : selectedVisitor.idFilePath && selectedVisitor.idFileType?.startsWith('image/') ? (
                <div>
                  <img
                    src={`/api/id-preview?id=${selectedVisitor.id}&guard=${encodeURIComponent(guardName || 'Security Guard')}`}
                    alt="ID Document"
                    style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              ) : selectedVisitor.idFilePath && selectedVisitor.idFileType === 'application/pdf' ? (
                <a
                  href={`/api/id-preview?id=${selectedVisitor.id}&guard=${encodeURIComponent(guardName || 'Security Guard')}`}
                  target="_blank"
                  rel="noopener"
                  style={{ color: '#18794e', textDecoration: 'underline', fontSize: 13, fontWeight: 700 }}
                >
                  Buksan ang Uploaded PDF ID
                </a>
              ) : (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#94a3b8' }}>
                  Walang in-upload na digital ID photo. Paki-hingi ang pisikal na valid ID sa mismong guard house bago mag-approve.
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
              >
                Isara
              </button>
              {(selectedVisitor.status || '').toLowerCase().includes('pending') && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      doAction(selectedVisitor, 'reject');
                    }}
                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reject ID
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      doAction(selectedVisitor, 'approve');
                    }}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✓ Approve &amp; Issue Gate Pass
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function GuardPage() {
  return (
    <div>
      <Navigation activeTab="guard" />
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: '#fff' }}>Kinakarga ang Guard Dashboard...</div>}>
        <GuardContent />
      </Suspense>
    </div>
  );
}
