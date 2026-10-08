import React, { forwardRef } from 'react';
import { ContributionCertificate } from '../../types/index.ts';
import { APP_NAME } from '../../data/content.ts';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';
import netelaTibebImg from '../../assets/images/ethiopian_netela_geometric_tibeb_1791345961753.jpg';

export interface ContributionCertificateExportProps {
  certificate: ContributionCertificate;
}

export const ContributionCertificateExport = forwardRef<HTMLDivElement, ContributionCertificateExportProps>(
  ({ certificate }, ref) => {
    const geezAmount = certificate.amountGeEz || `${toGeezNumber(certificate.amount)} : ብር`;
    const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1350px',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#1E1A17',
          color: '#201C18',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Exactly Vertical Ethiopian Netela Receipt Card (Portrait Slip) */}
        <div
          style={{
            width: '100%',
            maxWidth: '820px',
            backgroundColor: '#FAF7F0',
            borderRadius: '28px',
            border: '4px solid #9A7432',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            textAlign: 'center',
          }}
        >
          {/* Subtle Netela geometric art watermark with gentle colors */}
          <img
            src={netelaTibebImg}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.08,
              mixBlendMode: 'multiply',
              filter: 'saturate(0.8)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ padding: '60px 64px', display: 'flex', flexDirection: 'column', gap: '36px', position: 'relative', zIndex: 2 }}>
            {/* 1. Vertical Header Stack */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '2px solid rgba(216, 206, 186, 0.9)',
                paddingBottom: '28px',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#9A7432',
                }}
              >
                {APP_NAME.toUpperCase()} · ለወገን
              </span>
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#1E4D38',
                  margin: '2px 0 0 0',
                  lineHeight: 1.1,
                  letterSpacing: '0.01em',
                }}
              >
                Donation Receipt
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  color: '#5A4E3E',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontWeight: 800, color: '#8B1E1E' }}>
                  № {certificate.certificateId}
                </span>
                <span>·</span>
                <span style={{ fontWeight: 600 }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* 2. Vertical Verified Contribution Amount Plate */}
            <div
              style={{
                backgroundColor: 'rgba(245, 239, 227, 0.9)',
                border: '2px solid rgba(154, 116, 50, 0.4)',
                borderRadius: '20px',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: '#786A56',
                  margin: 0,
                }}
              >
                VERIFIED CONTRIBUTION AMOUNT
              </p>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '68px',
                  fontWeight: 900,
                  color: '#1E4D38',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}
              >
                {certificate.amount.toLocaleString()} ETB
              </div>
              <p
                style={{
                  fontFamily: "'Noto Serif Ethiopic', serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#9A7432',
                  margin: 0,
                }}
              >
                ({geezAmount})
              </p>
            </div>

            {/* 3. Vertical Details Flow (Stacked Labels & Values) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Donor */}
              <div
                style={{
                  borderBottom: '1.5px solid rgba(216, 206, 186, 0.6)',
                  paddingBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontFamily: 'monospace', color: '#786A56', textTransform: 'uppercase', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                  Donor
                </span>
                <span style={{ fontWeight: 800, fontSize: '26px', color: '#201C18' }}>
                  {certificate.donorName || 'Generous Citizen Patron'}
                </span>
              </div>

              {/* Cause */}
              <div
                style={{
                  borderBottom: '1.5px solid rgba(216, 206, 186, 0.6)',
                  paddingBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontFamily: 'monospace', color: '#786A56', textTransform: 'uppercase', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                  Cause Supported
                </span>
                <span style={{ fontWeight: 800, fontSize: '22px', color: '#1E4D38', maxWidth: '640px', lineHeight: 1.3 }}>
                  {certificate.campaignTitle}
                </span>
              </div>

              {/* Organization */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontFamily: 'monospace', color: '#786A56', textTransform: 'uppercase', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                  Organization
                </span>
                <span style={{ fontWeight: 600, color: '#4A3E31', fontSize: '18px' }}>
                  {certificate.organizationName} · {certificate.location}
                </span>
              </div>
            </div>

            {/* 4. Vertical Blessing & Record Stack */}
            <div
              style={{
                textAlign: 'center',
                borderTop: '2px solid rgba(216, 206, 186, 0.9)',
                paddingTop: '28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <p
                style={{
                  fontFamily: "'Noto Serif Ethiopic', serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#9A7432',
                  margin: 0,
                }}
              >
                ለወገን አለኝታ · እግዚአብሔር ይስጥልኝ!
              </p>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#786A56',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Civic Solidarity · Official Lewegene Record
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ContributionCertificateExport.displayName = 'ContributionCertificateExport';
