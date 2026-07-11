import { Transaction } from '../types';

/**
 * Helper to draw rounded rectangles on Canvas
 */
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a clean transaction receipt card on a canvas element
 */
function drawReceiptToCanvas(tx: Transaction): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 450;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#111415';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glow Gradient (SaukiGlobal brand color #66df75 glow)
  const glowGradient = ctx.createRadialGradient(
    canvas.width / 2, 0, 40,
    canvas.width / 2, 0, 320
  );
  glowGradient.addColorStop(0, 'rgba(102, 223, 117, 0.15)');
  glowGradient.addColorStop(1, 'rgba(102, 223, 117, 0)');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer border & Card container
  const cardMargin = 24;
  const cardWidth = canvas.width - (cardMargin * 2);
  const cardHeight = canvas.height - (cardMargin * 2);
  
  ctx.fillStyle = '#16191b';
  ctx.strokeStyle = tx.status === 'Failed' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(102, 223, 117, 0.25)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, cardMargin, cardMargin, cardWidth, cardHeight, 20);
  ctx.fill();
  ctx.stroke();

  // Branding Section
  const isFailed = tx.status === 'Failed';
  const accentColor = isFailed ? '#ef4444' : '#66df75';

  // Branding Logo Circle
  ctx.beginPath();
  ctx.arc(cardMargin + 32, cardMargin + 40, 16, 0, Math.PI * 2);
  ctx.fillStyle = isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(102, 223, 117, 0.15)';
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Branding Logo Check/Cross
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (isFailed) {
    // Cross
    ctx.moveTo(cardMargin + 27, cardMargin + 35);
    ctx.lineTo(cardMargin + 37, cardMargin + 45);
    ctx.moveTo(cardMargin + 37, cardMargin + 35);
    ctx.lineTo(cardMargin + 27, cardMargin + 45);
  } else {
    // Check mark
    ctx.moveTo(cardMargin + 25, cardMargin + 40);
    ctx.lineTo(cardMargin + 30, cardMargin + 45);
    ctx.lineTo(cardMargin + 39, cardMargin + 34);
  }
  ctx.stroke();

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SaukiGlobal', cardMargin + 56, cardMargin + 45);

  // Receipt Label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  drawRoundedRect(ctx, canvas.width - cardMargin - 90, cardMargin + 28, 80, 24, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TRANSACTION', canvas.width - cardMargin - 50, cardMargin + 43);
  ctx.textAlign = 'left';

  // Amount
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`₦${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, canvas.width / 2, cardMargin + 115);

  // Status Badge
  ctx.fillStyle = isFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 223, 117, 0.1)';
  drawRoundedRect(ctx, canvas.width / 2 - 60, cardMargin + 135, 120, 26, 13);
  ctx.fill();
  ctx.strokeStyle = isFailed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(102, 223, 117, 0.2)';
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(tx.status.toUpperCase(), canvas.width / 2, cardMargin + 152);
  ctx.textAlign = 'left';

  // Separator Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cardMargin + 20, cardMargin + 195);
  ctx.lineTo(canvas.width - cardMargin - 20, cardMargin + 195);
  ctx.stroke();
  ctx.setLineDash([]);

  // Data rows mapping
  let currentY = cardMargin + 235;
  const rowHeight = 36;
  const leftX = cardMargin + 20;
  const rightX = canvas.width - cardMargin - 20;

  const drawRow = (label: string, value: string, isGreen = false) => {
    ctx.fillStyle = 'rgba(225, 227, 228, 0.4)';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(label.toUpperCase(), leftX, currentY);

    ctx.fillStyle = isGreen ? '#66df75' : '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    
    // Check text wrap for description/details if they are too long
    const maxValWidth = 220;
    let displayVal = value;
    if (ctx.measureText(value).width > maxValWidth) {
      displayVal = value.substring(0, 28) + '...';
    }
    ctx.fillText(displayVal, rightX, currentY);
    ctx.textAlign = 'left';
    currentY += rowHeight;
  };

  // Add Complete synched database fields
  drawRow('Service', tx.type);
  if (tx.recipient) {
    drawRow('Recipient', tx.recipient);
  }
  if (tx.network) {
    drawRow('Network', tx.network.toUpperCase());
  }
  drawRow('Details', tx.details);
  if (tx.payment_method) {
    drawRow('Payment Method', tx.payment_method.toUpperCase());
  }
  if (tx.cashback_earned && tx.cashback_earned > 0) {
    drawRow('Cashback Earned', `₦${tx.cashback_earned.toFixed(2)}`, true);
  }
  drawRow('Date & Time', tx.date);
  drawRow('Reference ID', tx.id);

  // Separator above barcode
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.moveTo(cardMargin + 20, canvas.height - cardMargin - 85);
  ctx.lineTo(canvas.width - cardMargin - 20, canvas.height - cardMargin - 85);
  ctx.stroke();

  // Draw OPay-style barcode
  const barcodeY = canvas.height - cardMargin - 70;
  let barX = canvas.width / 2 - 75;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 35; i++) {
    const width = (i % 4 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
    ctx.fillRect(barX, barcodeY, width, 14);
    barX += width + 2;
  }

  // Footer Branding Label
  ctx.fillStyle = 'rgba(225, 227, 228, 0.12)';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SAUKIGLOBAL AUTOMATED TRANSACTION LEDGER', canvas.width / 2, canvas.height - cardMargin - 40);
  ctx.textAlign = 'left';

  return canvas;
}

/**
 * Dynamic sharing API for transaction receipts
 */
export async function shareReceiptAsImage(tx: Transaction) {
  const canvas = drawReceiptToCanvas(tx);
  
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      const file = new File([blob], `receipt_${tx.id}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'SaukiGlobal Receipt',
          text: `SaukiGlobal Transaction Receipt for ₦${tx.amount.toLocaleString()} - Reference: ${tx.id}`
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${tx.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing receipt:', err);
    }
  }, 'image/png');
}

/**
 * Directly download receipt image to device storage
 */
export function downloadReceiptImage(tx: Transaction) {
  const canvas = drawReceiptToCanvas(tx);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${tx.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
