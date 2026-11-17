'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '../components/Header';
import { GatePassCard } from '../components/GatePassCard';

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

const HEALTH_QUESTIONS = [
  '1. Diarrhea, vomiting, food poisoning, or stomach/bowel disorders?',
  '2. Cough, sweating/chills, fever, pneumonia, sore throat, severe cold/flu, or shortness of breath?',
  '3. Headache?',
  '4. Body pain?',
  '5. Hepatitis / jaundice?',
  '6. Typhoid / paratyphoid fever?',
  '7. Discharges from nose, eyes, ears, or gums?',
  '8. Boils, lesions, rash, acne, septic fingers, eczema, or any skin disease?',
  '9. Shortness of breath / difficulty breathing?',
  '10. Recently travelled from abroad where food-borne diseases are prevalent?',
  '11. Worked or stayed in the same close environment as a COVID-19 case?',
  '12. Contact with anyone with fever, cough, colds, or sore throat in the past 2 weeks?',
  '13. Travelled outside the Philippines in the last 14 days?',
  '14. Travelled to any area in NCR or Manila aside from your home?',
];

export default function HomePage() {
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
            setError('Paumanhin, na-reject ng Security Guard ang inyong registration. Mangyaring lumapit sa Guard House.');
            clearInterval(timer);
          }
        }
      } catch (e) {
        console.warn('Polling check notice:', e);
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isWaitingApproval, submittedVisitor]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError('File is too large. Use a file under 8 MB.'); return; }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Upload an image or PDF of the ID.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, idFileData: reader.result as string, idFileName: file.name, idFileType: file.type }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
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
          <h2 style={{ color: '#18794e', marginBottom: 16 }}>Visitor Registration</h2>

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
                Nai-submit na ang iyong rehistrasyon, {submittedVisitor.fullName}!
              </h3>
              <div style={{ fontSize: 16, color: '#15803d', fontWeight: 700, marginBottom: 14 }}>
                Pakihintay ng ilang sandali para sa approval ng Security Guard...
              </div>
              <p style={{ maxWidth: 560, margin: '0 auto 18px', color: '#374151', fontSize: 13.5, lineHeight: 1.5 }}>
                Ipinapasa na sa Guard House ang inyong impormasyon. Huwag isara ang pahinang ito.
                <b> Kusang magpa-pop up dito ang inyong opisyal na One-Time Gate Pass</b> oras na ma-aprubahan ito ng guard upang maaari ninyo itong agad picturan.
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
                <span>Kasalukuyang naghihintay ng tugon mula kay Guard...</span>
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
                  Kanselahin / Mag-register ng Iba
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!isWaitingApproval && (
            <form onSubmit={handleSubmit}>
              <h3 style={{ color: '#17324d', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 14 }}>
                Visitor Details
              </h3>
              <div className="grid">
                <div className="field">
                  <label>Visitor Type *</label>
                  <select required value={form.visitorType} onChange={e => setForm(f => ({ ...f, visitorType: e.target.value }))}>
                    <option value="">Select type</option>
                    {VISITOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Full Name *</label>
                  <input required placeholder="Full Name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Company / Address {form.visitorType === 'Applicant' ? '(Optional)' : '*'}</label>
                  <input
                    required={form.visitorType !== 'Applicant'}
                    placeholder={form.visitorType === 'Applicant' ? 'Optional for applicants' : 'Company / Address'}
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label>Contact Number</label>
                  <input type="tel" placeholder="Contact Number" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Person to Visit</label>
                  <input placeholder="Person to Visit (Opsyonal para sa truckers / delivery)" value={form.personToVisit} onChange={e => setForm(f => ({ ...f, personToVisit: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Purpose of Visit *</label>
                  <input required placeholder="Purpose of Visit" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                </div>

                <div className="field">
                  <label>Requested Area *</label>
                  <select required value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                    <option value="">Select area</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Vehicle Plate No.</label>
                  <input placeholder="Vehicle Plate No. (Optional)" value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Visit Date *</label>
                  <input required type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} />
                </div>

                <div className="field">
                  <label>Expected Time In *</label>
                  <input required type="time" value={form.expectedTime} onChange={e => setForm(f => ({ ...f, expectedTime: e.target.value }))} />
                </div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>Notes / Other Items</label>
                <textarea rows={2} placeholder="Optional" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              {/* Health Declaration Table */}
              <h3 style={{ color: '#17324d', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginTop: 24, marginBottom: 8 }}>
                Health Declaration (Required)
              </h3>
              <p className="muted" style={{ fontSize: 12, margin: '0 0 10px' }}>
                Answer each question truthfully. A &quot;Yes&quot; answer may require evaluation by the company nurse, safety officer, or first aider. Visitors with verified health concerns must not enter production areas unless cleared under company procedure.
              </p>

              <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 6, marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Health assessment — now or during the last 2 weeks, as applicable</th>
                      <th style={{ padding: '8px 12px', width: 140, textAlign: 'right' }}>Answer *</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HEALTH_QUESTIONS.map((q, idx) => (
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
                            <option value="">Select</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
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
                  I declare under penalty of company policy that the health information above is true and correct to the best of my knowledge.
                </label>
              </div>

              {/* Data Privacy & Optional ID Upload */}
              <h3 style={{ color: '#17324d', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginTop: 24, marginBottom: 8 }}>
                Data Privacy &amp; ID Verification (RA 10173)
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
                  I consent to the collection and processing of my name, contact details, company, visit purpose, and health declaration for security and biosecurity purposes per the Philippine Data Privacy Act of 2012 (RA 10173).
                </label>
              </div>

              <div className="grid two" style={{ marginTop: 12 }}>
                <div className="field">
                  <label>Valid ID Type (Optional)</label>
                  <select value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}>
                    {ID_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>ID Number (Optional)</label>
                  <input
                    placeholder="Ilagay ang ID number (o ipakita sa gate)"
                    value={form.idNumber}
                    onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>Upload ID Photo / Document (Opsyonal)</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
                <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Ang pag-upload ng ID photo ay <b>opsyonal</b>. Maaaring ipakita nang personal ang physical ID sa security guard sa gate.
                </p>
              </div>

              <div className="actions" style={{ marginTop: 16 }}>
                <button type="submit" disabled={loading} style={{ background: '#245b82' }}>
                  {loading ? 'Kinakarga...' : 'Submit Registration'}
                </button>
                <button type="button" className="secondary" onClick={reset}>Clear Form</button>
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
                🎉 NA-APPROVE NA ANG INYONG GATE PASS!
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
                📸 Maaari mo na itong <u>PICTURAN</u> o <u>I-SCREENSHOT</u> gamit ang iyong cellphone bago pumasok sa gate:
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
                ✓ Nakuha ko na ang litrato / Mag-register ng panibago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
