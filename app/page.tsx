'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation } from '../components/Header';
import { GatePassCard } from '../components/GatePassCard';
import { Language, translations, HEALTH_QUESTIONS_TL, HEALTH_QUESTIONS_EN } from '../lib/i18n';

const VISITOR_TYPES = [
  'Applicant',
  'Supplier',
  'Regulatory - LGU',
  'Live Truck',
  'Finished Goods Truck',
  'Repair - Engineering Work',
  'By-Product Contractor',
  'Peer Group',
  'Auditor',
  'Visitor',
  'Contractor',
  'Other',
];

const ID_TYPES = [
  'Philippine National ID (PhilID)',
  "Driver's License",
  'Passport',
  'SSS / UMID',
  'PRC ID',
  'Voter ID',
  'Company ID',
  'School ID',
  'Postal ID',
  'Barangay ID',
  'Other Government ID',
];

const AREAS = [
  'Office / Reception',
  'Production Area',
  'Warehouse / Logistics',
  'Engineering / Maintenance',
  'Canteen',
  'Compound / Parking',
  'Entire Facility',
];

export default function HomePage() {
  const [lang, setLang] = useState<Language>('tl');

  useEffect(() => {
    const saved = (localStorage.getItem('mhc_lang') as Language) || 'tl';
    setLang(saved);

    const onLangChange = (e: any) => {
      if (e.detail?.lang) setLang(e.detail.lang);
    };
    window.addEventListener('mhc_lang_changed', onLangChange);
    return () => window.removeEventListener('mhc_lang_changed', onLangChange);
  }, []);

  const switchLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('mhc_lang', newLang);
    window.dispatchEvent(new CustomEvent('mhc_lang_changed', { detail: { lang: newLang } }));
  };

  const t = translations[lang];
  const questions = lang === 'tl' ? HEALTH_QUESTIONS_TL : HEALTH_QUESTIONS_EN;

  const [form, setForm] = useState({
    visitorType: '', fullName: '', idType: 'Philippine National ID', idNumber: '', company: '',
    contact: '', personToVisit: '', purpose: '', area: '', plate: '',
    visitDate: new Date().toISOString().slice(0, 10), expectedTime: '',
    notes: '', healthAnswers: Array(14).fill(''), healthConsent: false,
    privacyConsent: false, idFileData: '', idFileName: '', idFileType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Waiting & Gate Pass Pop-up State
  const [submittedVisitor, setSubmittedVisitor] = useState<any>(null);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [approvedVisitor, setApprovedVisitor] = useState<any>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Polling for security approval
  useEffect(() => {
    if (!isWaitingApproval || !submittedVisitor?.id) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/visitors/${submittedVisitor.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const v = data.data;
          // Kapag na-approve na ng guard o may passCode na
          if (v.passCode || (v.status && v.status.toLowerCase().includes('approved'))) {
            setApprovedVisitor(v);
            setIsWaitingApproval(false);
            setShowPassModal(true);
            clearInterval(timer);
          } else if (v.status === 'Rejected') {
            setIsWaitingApproval(false);
            setError(lang === 'tl' ? 'Paumanhin, na-reject ng Security Guard ang inyong registration. Mangyaring lumapit sa Guard House.' : 'Your registration was rejected by Security. Please proceed to the Guard House.');
            clearInterval(timer);
          }
        }
      } catch (e) {
        console.warn('Polling check notice:', e);
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isWaitingApproval, submittedVisitor, lang]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError(lang === 'tl' ? 'Masyadong malaki ang file. Gumamit ng file na mas mababa sa 8 MB.' : 'File is too large. Please use a file under 8 MB.');
      return;
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError(lang === 'tl' ? 'Mag-upload ng imahe o PDF ng valid ID.' : 'Upload an image or PDF of the valid ID.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, idFileData: reader.result as string, idFileName: file.name, idFileType: file.type }));
    reader.readAsDataURL(file);
  };

  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current || loading) return;
    isSubmitting.current = true;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedVisitor(data.data);
        setIsWaitingApproval(true);
      } else {
        setError(data.error || (lang === 'tl' ? 'Nabigo ang registration. Pakisubukan muli.' : 'Registration failed. Please try again.'));
      }
    } catch {
      setError(lang === 'tl' ? 'Hindi maabot ang server. Pakisubukan muli.' : 'Could not reach server. Please try again.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const reset = () => {
    setSubmittedVisitor(null);
    setIsWaitingApproval(false);
    setApprovedVisitor(null);
    setShowPassModal(false);
    setError('');
    setForm({
      visitorType: '', fullName: '', idType: 'Philippine National ID', idNumber: '', company: '',
      contact: '', personToVisit: '', purpose: '', area: '', plate: '',
      visitDate: new Date().toISOString().slice(0, 10), expectedTime: '',
      notes: '', healthAnswers: Array(14).fill(''), healthConsent: false,
      privacyConsent: false, idFileData: '', idFileName: '', idFileType: '',
    });
  };

  return (
    <div>
      <Navigation activeTab="register" />
      <section className="panel active" style={{ maxWidth: 1200, margin: '20px auto', padding: '0 16px' }}>
        <div className="card">
          {/* Header & Language Switcher Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '2px solid #e2ece6', paddingBottom: 14, marginBottom: 18 }}>
            <h2 style={{ color: '#18794e', margin: 0, fontSize: 20 }}>{t.title}</h2>

            <div
              style={{
                display: 'inline-flex',
                background: '#f0fdf4',
                padding: '3px',
                borderRadius: 8,
                border: '1.5px solid #86efac',
              }}
            >
              <button
                type="button"
                onClick={() => switchLang('tl')}
                style={{
                  background: lang === 'tl' ? '#18794e' : 'transparent',
                  color: lang === 'tl' ? '#ffffff' : '#166534',
                  padding: '5px 12px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🇵🇭 Tagalog
              </button>
              <button
                type="button"
                onClick={() => switchLang('en')}
                style={{
                  background: lang === 'en' ? '#18794e' : 'transparent',
                  color: lang === 'en' ? '#ffffff' : '#166534',
                  padding: '5px 12px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="notice" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#991b1b', marginBottom: 14 }}>
              <b>Pabatid:</b> {error}
            </div>
          )}

          {/* Waiting for Guard Approval Screen */}
          {isWaitingApproval && submittedVisitor && (
            <div
              style={{
                border: '2px dashed #16a34a',
                background: '#f0fdf4',
                borderRadius: 12,
                padding: '36px 20px',
                textAlign: 'center',
                margin: '10px 0 20px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
              }}
            >
              <div style={{ fontSize: 46, marginBottom: 10 }}>⏳</div>
              <h3 style={{ fontSize: 20, color: '#166534', fontWeight: 800, margin: '0 0 6px' }}>
                {t.waitingTitle}, {submittedVisitor.fullName}!
              </h3>
              <div style={{ fontSize: 16, color: '#15803d', fontWeight: 700, marginBottom: 14 }}>
                {t.waitingSubtitle}
              </div>
              <p style={{ maxWidth: 560, margin: '0 auto 18px', color: '#374151', fontSize: 13.5, lineHeight: 1.5 }}>
                {t.waitingDesc}
              </p>

              {/* Pulsing Status Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  background: '#dcfce7',
                  borderRadius: 20,
                  border: '1px solid #86efac',
                  fontSize: 13,
                  color: '#166534',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                  }}
                />
                <span>{t.waitingPill}</span>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #bbf7d0' }}>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t.cancelBtn}
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!isWaitingApproval && (
            <form onSubmit={handleSubmit}>
              <h3 style={{ color: '#0e3d24', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 14 }}>
                {t.visitorDetails}
              </h3>
              <div className="grid">
                <div className="field">
                  <label>{t.visitorType}</label>
                  <select required value={form.visitorType} onChange={e => setForm(f => ({ ...f, visitorType: e.target.value }))}>
                    <option value="">{t.selectType}</option>
                    {VISITOR_TYPES.map(typ => <option key={typ} value={typ}>{typ}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t.fullName}</label>
                  <input required placeholder={t.fullName.replace(' *', '')} value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="field">
                  <label>
                    {t.company} {form.visitorType === 'Applicant' ? t.optionalForApplicant : '*'}
                  </label>
                  <input
                    required={form.visitorType !== 'Applicant'}
                    placeholder={form.visitorType === 'Applicant' ? t.optional : t.company}
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label>{t.contact}</label>
                  <input type="tel" placeholder={t.contact} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
                </div>
                <div className="field">
                  <label>{t.personToVisit}</label>
                  <input placeholder={t.personToVisitOptional} value={form.personToVisit} onChange={e => setForm(f => ({ ...f, personToVisit: e.target.value }))} />
                </div>
                <div className="field">
                  <label>{t.purpose}</label>
                  <input required placeholder={t.purpose.replace(' *', '')} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                </div>

                <div className="field">
                  <label>{t.area}</label>
                  <select required value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                    <option value="">{t.selectArea}</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t.plate}</label>
                  <input placeholder={t.plate} value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} />
                </div>
                <div className="field">
                  <label>{t.visitDate}</label>
                  <input required type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} />
                </div>

                <div className="field">
                  <label>{t.expectedTime}</label>
                  <input required type="time" value={form.expectedTime} onChange={e => setForm(f => ({ ...f, expectedTime: e.target.value }))} />
                </div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>{t.notes}</label>
                <textarea rows={2} placeholder={t.optional} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              {/* Health Declaration Table */}
              <h3 style={{ color: '#0e3d24', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginTop: 24, marginBottom: 8 }}>
                {t.healthTitle}
              </h3>
              <p className="muted" style={{ fontSize: 12, margin: '0 0 10px' }}>
                {t.healthDesc}
              </p>

              <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 6, marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#0e3d24' }}>
                      <th style={{ background: '#0e3d24', color: '#ffffff', padding: '10px 12px', fontWeight: 800 }}>{t.healthTableHeadQ}</th>
                      <th style={{ background: '#0e3d24', color: '#ffffff', padding: '10px 12px', width: 140, textAlign: 'right', fontWeight: 800 }}>{t.healthTableHeadA}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '8px 12px' }}>{q}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <select
                            required
                            value={form.healthAnswers[idx] || ''}
                            onChange={e => {
                              const ans = [...form.healthAnswers];
                              ans[idx] = e.target.value;
                              setForm(f => ({ ...f, healthAnswers: ans }));
                            }}
                            style={{ width: 110, padding: 6, fontSize: 13 }}
                          >
                            <option value="">{t.select}</option>
                            <option value="No">{t.no}</option>
                            <option value="Yes">{t.yes}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '10px 0 16px' }}>
                <input
                  type="checkbox"
                  id="healthConsent"
                  required
                  checked={form.healthConsent}
                  onChange={e => setForm(f => ({ ...f, healthConsent: e.target.checked }))}
                  style={{ width: 'auto', marginTop: 3 }}
                />
                <label htmlFor="healthConsent" style={{ fontWeight: 400, fontSize: 12.5, margin: 0 }}>
                  {t.healthConsent}
                </label>
              </div>

              {/* Data Privacy & Optional ID Upload */}
              <h3 style={{ color: '#0e3d24', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginTop: 24, marginBottom: 8 }}>
                {t.privacyTitle}
              </h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '8px 0 14px' }}>
                <input
                  type="checkbox"
                  id="privacyConsent"
                  required
                  checked={form.privacyConsent}
                  onChange={e => setForm(f => ({ ...f, privacyConsent: e.target.checked }))}
                  style={{ width: 'auto', marginTop: 3 }}
                />
                <label htmlFor="privacyConsent" style={{ fontWeight: 400, fontSize: 12.5, margin: 0 }}>
                  {t.privacyConsent}
                </label>
              </div>

              <div className="grid two" style={{ marginTop: 12 }}>
                <div className="field">
                  <label>{t.idType}</label>
                  <select value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}>
                    {ID_TYPES.map(idT => <option key={idT}>{idT}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t.idNumber}</label>
                  <input
                    placeholder={t.idNumberPlaceholder}
                    value={form.idNumber}
                    onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>{t.uploadId}</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
                <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {t.uploadNote}
                </p>
              </div>

              <div className="actions" style={{ marginTop: 16 }}>
                <button type="submit" disabled={loading} style={{ background: '#18794e' }}>
                  {loading ? t.submitting : t.submit}
                </button>
                <button type="button" className="secondary" onClick={reset}>{t.clear}</button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* POP-UP GATE PASS MODAL (Lalabas agad oras na ma-approve ng Guard!) */}
      {showPassModal && approvedVisitor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: 680,
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: 16,
              padding: '24px 20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              textAlign: 'center',
            }}
          >
            {/* Celebration Header */}
            <div
              style={{
                marginBottom: 16,
                padding: '14px 18px',
                background: '#ecfdf5',
                border: '1.5px solid #10b981',
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#065f46', marginBottom: 4 }}>
                {t.passApprovedTitle}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
                {t.passApprovedSubtitle}
              </div>
            </div>

            {/* Reusable Gate Pass Card */}
            <GatePassCard
              visitor={approvedVisitor}
              isModal={true}
              onPrint={() => window.print()}
              onClose={() => {
                setShowPassModal(false);
                reset();
              }}
            />

            {/* Bottom Button */}
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={() => {
                  setShowPassModal(false);
                  reset();
                }}
                style={{
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 26px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                }}
              >
                {t.closePassBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
