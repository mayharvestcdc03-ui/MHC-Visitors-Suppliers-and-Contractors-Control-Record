'use client';

import { QRCodeSVG } from 'qrcode.react';
import { getVisitorTheme } from '../lib/utils';

interface GatePassCardProps {
  visitor: any;
  onPrint?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function GatePassCard({ visitor, onPrint, onClose, isModal = false }: GatePassCardProps) {
  if (!visitor) return null;

  const theme = getVisitorTheme(visitor.visitorType);

  const getStatus = (r: any) => {
    if (!r.status) return 'Pending ID Verification';
    if (r.status === 'Approved - Pass Issued' && r.timeIn && !r.timeOut) return 'Entered';
    if (r.status === 'Approved - Pass Issued' && r.timeOut) return 'Completed';
    return r.status;
  };

  return (
    <div
      id="passCard"
      className="print-only-card"
      style={{
        maxWidth: 620,
        width: '100%',
        margin: '0 auto',
        border: `2.5px solid ${theme.color}`,
        borderRadius: 12,
        padding: '22px 24px',
        background: '#ffffff',
        boxShadow: isModal ? '0 20px 25px -5px rgba(0, 0, 0, 0.25)' : '0 4px 14px rgba(0,0,0,0.06)',
        position: 'relative',
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
            <img src="/mhc-logo.png" alt="MHC Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
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
          fontSize: 28,
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
      <div className="grid two" style={{ gap: '10px 20px', textAlign: 'left' }}>
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
            {visitor.company || '—'}
          </div>
        </div>

        <div>
          <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
            Visit Date &amp; Time
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
            {visitor.personToVisit || 'N/A - Delivery / Pick-up'}
          </div>
        </div>

        {visitor.plate && (
          <div>
            <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              Vehicle Plate No.
            </label>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#17212b' }}>
              🚛 {visitor.plate}
            </div>
          </div>
        )}

        <div>
          <label style={{ color: theme.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
            Valid ID Checked By
          </label>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#17212b' }}>
            {visitor.verifiedBy || 'Joshua Francisco'}
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
      <p style={{ fontSize: 12, lineHeight: 1.5, margin: '0 0 14px', color: '#17212b', textAlign: 'left' }}>
        <b>Security instructions:</b> This pass is valid only on the approved visit date shown above and for one entry only. It automatically becomes invalid after that date. Present it to the guard. Follow MHC security, GMP, PPE and visitor rules. Access to restricted/production areas requires separate authorization and an MHC guide.
      </p>

      <hr style={{ borderColor: '#e2e8f0', margin: '0 0 14px' }} />

      {/* QR Code Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, textAlign: 'left' }}>
        <div style={{ padding: 6, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
          <QRCodeSVG
            value={`MHC-PASS:${visitor.passCode || visitor.id}|${visitor.fullName}|${visitor.visitDate}|${visitor.area}`}
            size={96}
            level="M"
          />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#17212b', marginBottom: 4 }}>
            Scan for Visitor Do&apos;s and Don&apos;ts
          </div>
          <div style={{ fontSize: 11.5, color: '#555', lineHeight: 1.4 }}>
            Scan this QR code with a phone camera to read MHC visitor rules. Follow all current site instructions.
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#777', marginTop: 14, textAlign: 'left' }}>
        Keep this pass with the visitor record. Do not reuse or transfer it.
      </div>

      {/* Action Buttons inside Card / Modal */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
        <button
          type="button"
          onClick={onPrint || (() => window.print())}
          style={{
            flex: 1,
            background: '#18794e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🖨️ I-print / I-save bilang PDF
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Isara
          </button>
        )}
      </div>
    </div>
  );
}
