'use client';

import { useState } from 'react';
import { Navigation } from '../components/Header';

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
  'Other'
];

const ID_TYPES = [
  'Philippine National ID', "Driver's License", 'Passport', 'UMID',
  'SSS / GSIS ID', 'PRC ID', "Voter's ID",
  'Company ID with supporting government ID', 'Other government-issued ID'
];

const AREAS = [
  'Office / Reception', 'Warehouse', 'Loading Dock',
  'Production Area (requires approval and guide)',
  'Maintenance / Utility', 'Other / Specify in notes'
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
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

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
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setError(data.error || 'Registration failed. Please try again.');
    } catch { setError('Could not reach the server. Please try again.'); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setResult(null); setError('');
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
      <section className="panel active">
        <div className="card">
          <h2>Visitor Registration</h2>
          <div className="notice">
            <b>Shared offline mode:</b> when the shared folder is connected (see the bar above), visitor records are saved in that folder and every connected user sees the same data. If the bar says "this computer only", records are saved only in this browser. Keep the shared folder restricted to authorized staff and make regular backups.
          </div>

          {result && (
            <div className="notice" style={{ borderColor: '#a8d5b5', background: '#e7f6ee', color: '#0f5c3a', marginTop: 14 }}>
              <b>Registration saved.</b><br />
              Reference: <b>{result.id}</b><br />
              Status: <span className="status pending">Pending ID Verification</span>. The visitor details and physical valid ID must be visually checked by authorized security staff before a one-time gate pass can be issued.
              <div style={{ marginTop: 12 }}>
                <button type="button" onClick={reset}>Register Another Visitor</button>
              </div>
            </div>
          )}

          {!result && (
            <form onSubmit={handleSubmit}>
              <h3>Visitor Details</h3>
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
                    placeholder={form.visitorType === 'Applicant' ? 'Applicant / Address' : 'Company / Address'}
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
                  <input placeholder="Vehicle Plate No." value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Visit Date *</label>
                  <input required type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} />
                </div>

                <div className="field">
                  <label>Expected Time In *</label>
                  <input required type="time" value={form.expectedTime} onChange={e => setForm(f => ({ ...f, expectedTime: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Valid ID Type *</label>
                  <select required value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}>
                    {ID_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>ID Number (Optional)</label>
                  <input placeholder="ID Number (o ipakita sa gate)" value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} autoComplete="off" />
                </div>

                <div className="field wide">
                  <label>Notes / Other Items</label>
                  <textarea rows={2} placeholder="Optional" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              <h3>Health Declaration (Required)</h3>
              <p className="muted">
                Answer each question truthfully. A "Yes" answer may require evaluation by the company nurse, safety officer, or first aider. Visitors with verified health concerns must not enter production areas unless cleared under company procedure.
              </p>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Health assessment — now or during the last 2 weeks, as applicable</th>
                      <th style={{ width: 140 }}>Answer *</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HEALTH_QUESTIONS.map((q, i) => (
                      <tr key={i}>
                        <td>{q}</td>
                        <td>
                          <select
                            required
                            value={form.healthAnswers[i]}
                            onChange={e => setForm(f => ({
                              ...f,
                              healthAnswers: f.healthAnswers.map((a, ai) => ai === i ? e.target.value : a)
                            }))}
                          >
                            <option value="">Select</option>
                            <option>No</option>
                            <option>Yes</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid two" style={{ marginTop: 12 }}>
                <div className="field wide">
                  <label>Health declaration *</label>
                  <div>
                    <input
                      type="checkbox"
                      required
                      checked={form.healthConsent}
                      onChange={e => setForm(f => ({ ...f, healthConsent: e.target.checked }))}
                    />
                    {' '}I declare that my answers are truthful and authorize MHC to process this information for visitor health and access control, subject to applicable privacy requirements.
                  </div>
                </div>
              </div>

              <h3>Identity Verification Upload (Optional)</h3>
              <div className="grid two">
                <div className="field">
                  <label>Upload clear image or scan of valid ID (Optional)</label>
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} />
                  {form.idFileName && <span className="muted" style={{ fontSize: 12 }}> ✓ {form.idFileName}</span>}
                </div>
                <div className="field">
                  <label>Privacy acknowledgement *</label>
                  <div>
                    <input
                      type="checkbox"
                      required
                      checked={form.privacyConsent}
                      onChange={e => setForm(f => ({ ...f, privacyConsent: e.target.checked }))}
                    />
                    {' '}I understand my information and ID details will be used for visitor security and access control.
                  </div>
                </div>
              </div>
              <p className="muted">Ang pag-upload ng ID photo ay opsyonal. Maaaring ipakita nang personal ang physical ID sa security guard sa gate.</p>

              {error && <div className="notice" style={{ borderColor: '#f5c6cb', background: '#fff3f3', color: '#721c24' }}>{error}</div>}
              <div className="actions">
                <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Submit Registration'}</button>
                <button type="button" className="secondary" onClick={reset}>Clear Form</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
