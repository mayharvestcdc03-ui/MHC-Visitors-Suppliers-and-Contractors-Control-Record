'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/Header';

function GuardContent() {
  const params = useSearchParams();
  const [guardName, setGuardName] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'verified' | 'expired' | ''>('');

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/visitors');
    const data = await res.json();
    if (data.success) setVisitors(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  // Auto-select visitor from URL ?select=<id>
  useEffect(() => {
    const selectId = params.get('select');
    if (selectId && visitors.length > 0) {
      setSelectedId(selectId);
    }
  }, [params, visitors]);

  const selected = visitors.find(v => v.id === selectedId);

  const getStatus = (r: any) => r?.status || 'Pending ID Verification';

  const statusClass = (s: string) => {
    if (s.includes('Approved') || s === 'Entered') return 'verified';
    if (s === 'Rejected') return 'expired';
    return 'pending';
  };

  const showMsg = (msg: string, type: 'verified' | 'expired' | '') => {
    setMessage(msg); setMessageType(type);
  };

  const doAction = async (action: string) => {
    if (!selected) return alert('Select a visitor first.');
    if (!guardName.trim()) return alert('Enter guard/verifier name.');
    const r = selected;
    const st = getStatus(r);

    if (action === 'approve') {
      if (st === 'Rejected') return alert('Rejected registration cannot be approved. Register again or follow your company process.');
    }
    if (action === 'reject') {
      if (r.passUsed) return alert('This pass has already been used. Record the issue in notes and follow security procedure.');
    }
    if (action === 'entry') {
      if (!r.passCode || !['Approved - Pass Issued', 'Entered'].includes(st)) return alert('No approved pass. Verify the ID and issue a pass first.');
      if (r.passUsed || r.timeIn) return alert('This one-time pass has already been used for entry. Do not allow re-entry.');
      const today = new Date().toISOString().slice(0, 10);
      if (r.visitDate !== today) return alert('Pass is not valid for today.');
    }
    if (action === 'exit') {
      if (!r.timeIn) return alert('No entry recorded for this visitor.');
      if (r.timeOut) return alert('Exit has already been recorded.');
    }

    const res = await fetch(`/api/visitors/${r.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, guardName }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchVisitors();
      if (action === 'approve') {
        const updated = data.data;
        showMsg(`ID marked as visually verified. One-time pass issued: <b>${updated.passCode}</b>`, 'verified');
        window.location.href = `/pass?id=${r.id}`;
      } else if (action === 'reject') {
        showMsg('Registration rejected. No gate pass is active.', 'expired');
      } else if (action === 'entry') {
        showMsg('Entry recorded. This one-time pass is now USED and cannot be used again.', 'verified');
      } else if (action === 'exit') {
        showMsg('Exit recorded.', '');
      }
    } else {
      alert(data.error || 'Action failed.');
    }
  };

  return (
    <section className="panel active">
      <div className="card">
        <h2>ID Verification / Security Guard</h2>
        <div className="grid two">
          <div>
            <label>Select registration</label>
            <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setMessage(''); }}>
              <option value="">Select visitor</option>
              {visitors.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fullName} — {r.visitDate} — {getStatus(r)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Guard / Verifier Name *</label>
            <input value={guardName} onChange={e => setGuardName(e.target.value)} placeholder="Enter your name" />
          </div>
        </div>

        {/* Visitor Details */}
        <div id="verifyDetails" className="notice" style={{ marginTop: 10 }}>
          {!selected ? (
            'Select a registration to review its details and uploaded ID.'
          ) : (
            <>
              <b>{selected.fullName}</b> ({selected.visitorType})<br />
              Company: {selected.company}<br />
              ID: {selected.idType} — {selected.idNumber}<br />
              Purpose: {selected.purpose}<br />
              Person to visit: {selected.personToVisit}<br />
              Requested area: {selected.area}<br />
              Health answers: {(() => {
                try {
                  const arr = JSON.parse(selected.healthAnswers || '[]');
                  return arr.map((v: string, i: number) => `${i + 1}: ${v}`).join('; ');
                } catch { return selected.healthAnswers; }
              })()}<br />
              Visit date: {selected.visitDate} {selected.expectedTime}<br />
              Uploaded file: {selected.idFileName || 'No file'}<br />
              Status: <span className={`status ${statusClass(getStatus(selected))}`}>{getStatus(selected)}</span><br />
              Current pass: {selected.passCode || 'Not issued'}
            </>
          )}
        </div>

        {/* ID Image Preview — guard name passed to API for RA 10173 audit log */}
        {selected && selected.idPurgedAt && (
          <div className="notice" style={{ background: '#f8f9fa', borderColor: '#aaa', color: '#555', marginTop: 10 }}>
            🗑 <b>ID document purged</b> — deleted per RA 10173 ({new Date(selected.idPurgedAt).toLocaleDateString()}).
            Only the visitor record is retained.
          </div>
        )}
        {selected && selected.idFilePath && !selected.idPurgedAt && selected.idFileType?.startsWith('image/') && (
          <div style={{ marginTop: 10 }}>
            <p className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
              🔒 Viewing this ID is logged per RA 10173. Guard name required above before viewing.
            </p>
            <img
              src={`/api/id-preview?id=${selected.id}&guard=${encodeURIComponent(guardName || 'Unknown')}`}
              alt="Uploaded ID for review"
              style={{ maxWidth: '100%', maxHeight: 440, border: '1px solid #ccd', borderRadius: 8 }}
            />
          </div>
        )}
        {selected && selected.idFilePath && !selected.idPurgedAt && selected.idFileType === 'application/pdf' && (
          <div style={{ marginTop: 10 }}>
            <a
              href={`/api/id-preview?id=${selected.id}&guard=${encodeURIComponent(guardName || 'Unknown')}`}
              target="_blank" rel="noopener"
            >
              Open uploaded ID PDF (access is logged)
            </a>
          </div>
        )}
        {selected && !selected.idFilePath && !selected.idPurgedAt && (
          <p className="muted">ID preview unavailable.</p>
        )}

        <div className="actions">
          <button className="success" onClick={() => doAction('approve')}>Approve ID &amp; Issue One-Time Pass</button>
          <button className="danger" onClick={() => doAction('reject')}>Reject ID</button>
          <button onClick={() => doAction('entry')}>Record Entry (use pass)</button>
          <button className="secondary" onClick={() => doAction('exit')}>Record Exit</button>
          <button className="secondary" onClick={fetchVisitors}>Refresh List</button>
        </div>

        <p className="muted">Approve only after visually checking the original valid ID against the uploaded copy and confirming visit authorization. Each pass can be used for entry only once. Exit recording does not reactivate the pass.</p>

        {message && (
          <div
            className="notice"
            style={messageType === 'verified' ? { borderColor: '#a8d5b5', background: '#e7f6ee', color: '#0f5c3a' } : messageType === 'expired' ? { borderColor: '#f5c6cb', background: '#fff3f3', color: '#721c24' } : {}}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
      </div>
    </section>
  );
}

export default function GuardPage() {
  return (
    <div>
      <Navigation activeTab="guard" />
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <GuardContent />
      </Suspense>
    </div>
  );
}
