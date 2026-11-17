'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Navigation } from '../../components/Header';

export default function QrRegisterPage() {
  const [registerUrl, setRegisterUrl] = useState('https://mhc-visitor-management.onrender.com/');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRegisterUrl(window.location.origin);
    }
  }, []);

  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(registerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div>
      <Navigation activeTab="qr" />

      {/* Control bar (Hidden on print) */}
      <div className="no-print" style={{ maxWidth: 850, margin: '20px auto 10px', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', color: '#18794e', fontSize: 20 }}>
            Gate Entrance QR Standee / Signage
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
            I-print at ilagay ang standee na ito sa Guard House / Gate Entrance upang i-scan ng mga bisita at trucker gamit ang kanilang cellphone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: '#18794e',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 8,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(24, 121, 78, 0.3)',
            }}
          >
            🖨️ I-print ang Standee Poster
          </button>
          <button
            type="button"
            onClick={copyLink}
            style={{
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #86efac',
              padding: '10px 14px',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            {copied ? '✓ Nakopya na!' : '📋 Kopyahin ang Link'}
          </button>
        </div>
      </div>

      {/* Printable Standee Sheet */}
      <div style={{ maxWidth: 850, margin: '10px auto 40px', padding: '0 16px' }}>
        <div
          id="qrStandee"
          style={{
            background: '#ffffff',
            border: '4px solid #18794e',
            borderRadius: 16,
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}
        >
          {/* Company Branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, borderBottom: '3px solid #18794e', paddingBottom: 20, marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', borderRadius: 12, padding: 6, border: '1px solid #bbf7d0' }}>
              <img src="/mhc-logo.png" alt="May Harvest Corporation" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0e3d24', letterSpacing: 0.5 }}>
                MAY HARVEST CORPORATION
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#18794e', letterSpacing: 1, textTransform: 'uppercase' }}>
                Visitor, Supplier &amp; Trucker Control Record
              </div>
              <div style={{ fontSize: 12, color: '#4b6354', fontWeight: 600 }}>
                Touch-Free &amp; Paperless Registration Portal • RA 10173 Compliant
              </div>
            </div>
          </div>

          {/* Big Headline */}
          <div style={{ margin: '0 0 20px' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#18794e',
                color: '#ffffff',
                padding: '6px 20px',
                borderRadius: 24,
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              📱 TOUCHLESS CHECK-IN
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0e3d24', margin: '6px 0', lineHeight: 1.2 }}>
              ITUTOK ANG CAMERA DITO
            </h1>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#166534', margin: 0 }}>
              I-scan ang QR code gamit ang inyong cellphone upang mag-register
            </p>
          </div>

          {/* High-Resolution QR Code */}
          <div
            style={{
              display: 'inline-block',
              padding: 16,
              background: '#ffffff',
              border: '4px solid #18794e',
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(24, 121, 78, 0.15)',
              margin: '6px 0 20px',
            }}
          >
            <QRCodeSVG
              value={registerUrl}
              size={240}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Registration URL text */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: '#4b6354', fontWeight: 600 }}>O bisitahin ang link sa browser:</span>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#18794e', fontFamily: 'monospace', marginTop: 2 }}>
              {registerUrl}
            </div>
          </div>

          {/* 3 Step Instructions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
              textAlign: 'left',
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 12,
              padding: '20px 22px',
              marginTop: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#18794e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0e3d24', marginBottom: 2 }}>
                  Buksan ang Camera
                </div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>
                  Buksan ang Camera app ng inyong cellphone (iOS o Android).
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#18794e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                2
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0e3d24', marginBottom: 2 }}>
                  Itutok sa QR Code
                </div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>
                  Itapat sa QR code at i-tap ang notification / link na lilitaw.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#18794e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                3
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0e3d24', marginBottom: 2 }}>
                  Sagutan &amp; Hintayin
                </div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>
                  Punan ang form. Kusang lalabas ang Gate Pass pagka-approve ng Guard.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div style={{ marginTop: 24, fontSize: 11.5, color: '#4b6354', borderTop: '1px solid #d1fae5', paddingTop: 14 }}>
            <b>Seguridad at Proteksyon ng Datos:</b> Ang inyong impormasyon ay pinangangalagaan alinsunod sa Philippine Data Privacy Act of 2012 (RA 10173) at Good Manufacturing Practices (GMP) ng May Harvest Corporation.
          </div>
        </div>
      </div>
    </div>
  );
}
