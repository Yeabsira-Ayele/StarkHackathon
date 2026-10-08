import { toBlob } from 'html-to-image';
import { ContributionCertificate } from '../../types/index.ts';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';
import donorJoyImg from '../../assets/images/ethiopian_donor_joy_1791345351377.jpg';

export const sanitizeCertificateFilename = (certificateId: string): string => {
  const sanitized = certificateId.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
  return `lewegene-certificate-${sanitized}.png`;
};

/**
 * Fallback pure HTML5 Canvas renderer to guarantee 100% reliable 1080x1350 PNG export
 * with full-bleed Ethiopian mosaic & folk-art banknote tapestry.
 */
export async function renderCertificateToCanvasFallback(
  certificate: ContributionCertificate,
  muralImgUrl: string
): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // 1. Base Layer
  ctx.fillStyle = '#1E1A17';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Full-Bleed Ethiopian Mosaic & Folk Art Background Image
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = muralImgUrl;
    await new Promise((resolve) => {
      if (img.complete) resolve(null);
      else {
        img.onload = () => resolve(null);
        img.onerror = () => resolve(null);
      }
    });

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      // Procedural fallback mosaic tiles if image is unavailable
      ctx.fillStyle = '#2A435E';
      ctx.fillRect(0, 0, width, height / 3);
      ctx.fillStyle = '#9A7432';
      ctx.fillRect(0, height / 3, width, height / 3);
      ctx.fillStyle = '#1E4D38';
      ctx.fillRect(0, (2 * height) / 3, width, height / 3);
    }
  } catch {
    // Fallback if image load fails
  }

  // 3. Stained Glass Dark Leading Lines Overlay
  ctx.strokeStyle = '#181512';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(540, 0); ctx.lineTo(0, 420);
  ctx.moveTo(540, 0); ctx.lineTo(1080, 420);
  ctx.moveTo(540, 0); ctx.lineTo(160, 1350);
  ctx.moveTo(540, 0); ctx.lineTo(920, 1350);
  ctx.moveTo(0, 210); ctx.lineTo(1080, 210);
  ctx.moveTo(0, 1140); ctx.lineTo(1080, 1140);
  ctx.moveTo(180, 0); ctx.lineTo(180, 1350);
  ctx.moveTo(900, 0); ctx.lineTo(900, 1350);
  ctx.stroke();

  // 4. Illuminated Vellum Banknote Chamber
  const pad = 40;
  ctx.fillStyle = 'rgba(252, 249, 242, 0.88)';
  ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2);

  // Banknote borders
  ctx.strokeStyle = '#1E4D38';
  ctx.lineWidth = 8;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.strokeStyle = '#9A7432';
  ctx.lineWidth = 3;
  ctx.strokeRect(pad + 8, pad + 8, width - (pad + 8) * 2, height - (pad + 8) * 2);

  // 5. Denomination Badges in 4 corners
  const geez = certificate.amountGeEz || `${toGeezNumber(certificate.amount)} : ብር`;
  const corners = [
    { x: pad - 20, y: pad - 20 },
    { x: width - pad - 64, y: pad - 20 },
    { x: pad - 20, y: height - pad - 64 },
    { x: width - pad - 64, y: height - pad - 64 },
  ];

  corners.forEach(({ x, y }) => {
    ctx.fillStyle = '#F7F2E7';
    ctx.fillRect(x, y, 84, 84);
    ctx.strokeStyle = '#9A7432';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 84, 84);

    ctx.fillStyle = '#1E4D38';
    ctx.font = 'bold 22px "Cinzel", serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(String(certificate.amount), x + 42, y + 38);

    ctx.fillStyle = '#9A7432';
    ctx.font = 'bold 13px "Noto Serif Ethiopic", serif, system-ui';
    ctx.fillText(geez, x + 42, y + 68);
  });

  // 6. Header & Serial
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1E4D38';
  ctx.font = '900 22px "Courier New", monospace';
  ctx.fillText(`№ ${certificate.certificateId}`, 150, 95);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#9A7432';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('NATIONAL CITIZEN SOLIDARITY TENDER', width - 150, 85);
  ctx.fillStyle = '#1E4D38';
  ctx.font = 'bold 16px "Noto Serif Ethiopic", serif, system-ui';
  ctx.fillText('የኢትዮጵያ ሕዝባዊ አስተዋጽኦ ሰነድ', width - 150, 110);

  // 7. Lewegene Brand Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9A7432';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('ARCHIVAL CITIZEN SOLIDARITY CERTIFICATE', width / 2, 175);

  ctx.fillStyle = '#26211C';
  ctx.font = '900 48px "Cinzel", serif, system-ui';
  ctx.fillText('LEWEGENE · ለወገን', width / 2, 235);

  ctx.fillStyle = '#5A4E3E';
  ctx.font = 'italic 19px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Official recognition of verified civic underwriting and direct community impact', width / 2, 275);

  // 8. Central Patron & Cause Recognition Chamber
  const chamberY = 320;
  const chamberH = 760;
  ctx.fillStyle = 'rgba(247, 242, 231, 0.94)';
  ctx.fillRect(100, chamberY, width - 200, chamberH);
  ctx.strokeStyle = 'rgba(154, 116, 50, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, chamberY, width - 200, chamberH);

  // Joyful Celebratory Community Gratitude Artwork
  try {
    const joyImg = new Image();
    joyImg.crossOrigin = 'anonymous';
    joyImg.src = donorJoyImg;
    await new Promise((resolve) => {
      if (joyImg.complete) resolve(null);
      else {
        joyImg.onload = () => resolve(null);
        joyImg.onerror = () => resolve(null);
      }
    });

    if (joyImg.complete && joyImg.naturalWidth > 0) {
      const artX = 140;
      const artY = chamberY + 20;
      const artW = width - 280;
      const artH = 170;
      ctx.drawImage(joyImg, artX, artY, artW, artH);
      ctx.strokeStyle = '#1E4D38';
      ctx.lineWidth = 3;
      ctx.strokeRect(artX, artY, artW, artH);

      // Ribbon
      ctx.fillStyle = 'rgba(20, 18, 14, 0.92)';
      ctx.fillRect(artX, artY + artH - 30, artW, 30);
      ctx.fillStyle = '#D8B066';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('✨ ለወገን አለኝታ · እግዚአብሔር ይስጥልኝ!', artX + 12, artY + artH - 10);
      ctx.fillStyle = '#F4EFE6';
      ctx.textAlign = 'right';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('HEARTFELT COMMUNITY GRATITUDE', artX + artW - 12, artY + artH - 10);
      ctx.textAlign = 'center';
    }
  } catch {
    // Graceful fallback
  }

  ctx.fillStyle = '#786A56';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('DISTINGUISHED PATRON & BENEFACTOR', width / 2, chamberY + 235);

  ctx.fillStyle = '#1E4D38';
  ctx.font = 'bold 42px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(certificate.donorName || 'Generous Citizen Patron', width / 2, chamberY + 285);

  // Large Currency Denomination Badge
  ctx.fillStyle = '#FCF9F2';
  ctx.fillRect(width / 2 - 240, chamberY + 315, 480, 110);
  ctx.strokeStyle = '#1E4D38';
  ctx.lineWidth = 3;
  ctx.strokeRect(width / 2 - 240, chamberY + 315, 480, 110);

  ctx.fillStyle = '#26211C';
  ctx.font = '900 48px "Cinzel", serif, system-ui';
  ctx.fillText(`${certificate.amount.toLocaleString()} ETB`, width / 2, chamberY + 375);

  ctx.fillStyle = '#9A7432';
  ctx.font = 'bold 20px "Noto Serif Ethiopic", serif, system-ui';
  ctx.fillText(`(${geez})`, width / 2, chamberY + 410);

  // Designated Cause
  ctx.fillStyle = '#786A56';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('UNDERWRITTEN CAUSE', width / 2, chamberY + 465);

  ctx.fillStyle = '#201C18';
  ctx.font = 'bold 28px "Cinzel", serif, system-ui';
  ctx.fillText(certificate.campaignTitle, width / 2, chamberY + 505);

  ctx.fillStyle = '#9A7432';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(`${certificate.organizationName} · ${certificate.location}`, width / 2, chamberY + 540);

  // Impact Statement
  ctx.fillStyle = '#FCF9F2';
  ctx.fillRect(150, chamberY + 575, width - 300, 120);
  ctx.strokeStyle = 'rgba(154, 116, 50, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(150, chamberY + 575, width - 300, 120);

  ctx.fillStyle = '#1E4D38';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`CIVIC IMPACT: ${certificate.impactSummary}`, width / 2, chamberY + 620);

  ctx.fillStyle = '#5A4E3E';
  ctx.font = 'italic 17px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('“Your generous contribution directly transforms lives and strengthens community resilience.”', width / 2, chamberY + 665);

  // 9. Signatures & Footer
  const footY = 1180;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#201C18';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`ISSUED: ${new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 100, footY);
  ctx.fillStyle = '#5A4E3E';
  ctx.font = '13px monospace';
  ctx.fillText(`TRANSACTION REF: ${certificate.transactionRef}`, 100, footY + 26);
  ctx.fillStyle = '#1E4D38';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`VERIFIED VIA: ${(certificate.paymentRail?.toUpperCase() || "—")} ESCROW`, 100, footY + 52);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#1E4D38';
  ctx.font = 'italic 20px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Board of Philanthropic Oversight & Civic Escrow', width - 100, footY + 12);
  ctx.fillStyle = '#786A56';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('AUTHENTICATED DIGITAL ARCHIVE CERTIFICATE', width - 100, footY + 38);
  ctx.fillStyle = '#9A7432';
  ctx.font = '13px "Noto Serif Ethiopic", serif';
  ctx.fillText('ለወገን አለኝታ · ሉዓላዊ ማህደር', width - 100, footY + 62);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas blob export returned null'));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Capture element to high-res PNG Blob.
 * Tries html-to-image first; on any issue, uses canvas fallback.
 */
export async function generateCertificatePngBlob(
  element: HTMLElement | null,
  certificate: ContributionCertificate,
  muralImgUrl: string
): Promise<Blob> {
  if (element) {
    try {
      const blob = await toBlob(element, {
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: '#1E1A17',
      });
      if (blob && blob.size > 1000) {
        return blob;
      }
    } catch {
      // Fall through to canvas fallback
    }
  }

  return renderCertificateToCanvasFallback(certificate, muralImgUrl);
}

/**
 * Triggers native browser download for the generated PNG Blob.
 */
export function downloadPngFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Shares the generated certificate PNG image using Web Share API with File sharing.
 * If file sharing is not supported, gracefully falls back to downloading the image.
 */
export async function shareCertificateImageFile(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });

  const hasNavigator = typeof navigator !== 'undefined';
  const canShare = hasNavigator && typeof navigator.share === 'function';
  const canShareFiles = canShare && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return 'shared';
    } catch (err: any) {
      if (
        err?.name === 'AbortError' ||
        err?.name === 'NotAllowedError' ||
        err?.message?.toLowerCase().includes('cancel') ||
        err?.message?.toLowerCase().includes('abort')
      ) {
        return 'shared';
      }
      downloadPngFile(blob, filename);
      return 'downloaded';
    }
  }

  downloadPngFile(blob, filename);
  return 'downloaded';
}
