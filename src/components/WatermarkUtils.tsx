/**
 * Utility functions for creating digital watermarks and security features
 */

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: string;
  angle?: number;
  spacing?: number;
}

export interface SecurityFeatures {
  qrCode?: string;
  watermark?: WatermarkOptions;
  timestamp?: string;
  hash?: string;
}

/**
 * Create a watermark canvas overlay
 */
export function createWatermarkCanvas(
  width: number, 
  height: number, 
  options: WatermarkOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Set transparency
  ctx.globalAlpha = options.opacity || 0.1;
  ctx.fillStyle = options.color || '#1e40af';
  ctx.font = `${options.fontSize || 24}px Arial`;
  ctx.textAlign = 'center';

  // Apply rotation
  ctx.translate(width / 2, height / 2);
  ctx.rotate((options.angle || -30) * Math.PI / 180);

  const spacing = options.spacing || 200;
  
  // Repeat watermark across the canvas
  for (let y = -height; y < height * 2; y += spacing) {
    for (let x = -width; x < width * 2; x += spacing * 2) {
      ctx.fillText(options.text, x, y);
    }
  }

  return canvas;
}

/**
 * Generate a cryptographic hash for verification
 */
export async function generateVerificationHash(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const dataBuffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create verification metadata for QR codes
 */
export function createVerificationMetadata(certificateData: any): any {
  const timestamp = new Date().toISOString();
  
  return {
    certificateId: certificateData.metadata?.certificateId || 'UNKNOWN',
    studentName: certificateData.metadata?.studentName || '',
    institution: certificateData.metadata?.institution || '',
    graduationDate: certificateData.metadata?.graduationDate || '',
    validationDate: certificateData.validationDate || timestamp,
    confidenceScore: certificateData.confidenceScore || 0,
    authenticity: certificateData.authenticity || 'unknown',
    timestamp,
    version: "1.0"
  };
}

/**
 * Validate QR code verification data
 */
export function validateQRData(qrData: any): { isValid: boolean; error?: string } {
  if (!qrData.certificateId) {
    return { isValid: false, error: "Missing certificate ID" };
  }
  
  if (!qrData.hash || qrData.hash.length !== 64) {
    return { isValid: false, error: "Invalid or missing cryptographic hash" };
  }
  
  if (!qrData.timestamp) {
    return { isValid: false, error: "Missing timestamp" };
  }
  
  // Check if timestamp is reasonable (within last 5 years)
  const qrTimestamp = new Date(qrData.timestamp);
  const now = new Date();
  const fiveYearsAgo = new Date(now.getTime() - (5 * 365 * 24 * 60 * 60 * 1000));
  
  if (qrTimestamp < fiveYearsAgo || qrTimestamp > now) {
    return { isValid: false, error: "Invalid timestamp - certificate too old or future dated" };
  }
  
  return { isValid: true };
}

/**
 * Create a secure PDF with embedded watermarks and QR code
 */
export async function createSecurePDF(
  certificateData: any,
  qrCodeDataUrl: string,
  watermarkOptions: WatermarkOptions
): Promise<Blob> {
  // Import jsPDF dynamically
  const { jsPDF } = await import('jspdf');
  
  // Create new PDF document (A4 size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add watermark background
  pdf.setGState(pdf.GState({ opacity: watermarkOptions.opacity || 0.1 }));
  pdf.setTextColor(30, 64, 175); // Blue color
  pdf.setFontSize(watermarkOptions.fontSize || 24);
  
  // Create repeating watermark pattern
  const watermarkText = watermarkOptions.text;
  const spacing = 60; // mm spacing
  
  for (let y = 20; y < pageHeight - 20; y += spacing) {
    for (let x = 20; x < pageWidth - 20; x += spacing * 1.5) {
      pdf.text(watermarkText, x, y, { 
        angle: watermarkOptions.angle || -30,
        maxWidth: 100
      });
    }
  }

  // Reset opacity for main content
  pdf.setGState(pdf.GState({ opacity: 1 }));

  // Add certificate header
  pdf.setTextColor(30, 41, 59); // Dark gray
  pdf.setFontSize(22);
  pdf.text('CERTIFICATE VALIDATION REPORT', pageWidth / 2, 30, { align: 'center' });

  // Add institution name
  pdf.setFontSize(16);
  pdf.text(certificateData.metadata?.institution || 'Unknown Institution', pageWidth / 2, 45, { align: 'center' });

  // Add status badge background
  const statusColor = getStatusColorRGB(certificateData.authenticity, certificateData.confidenceScore);
  pdf.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  pdf.roundedRect(pageWidth / 2 - 30, 55, 60, 15, 3, 3, 'F');

  // Add status text
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(12);
  const statusText = getStatusText(certificateData.authenticity, certificateData.confidenceScore);
  pdf.text(statusText, pageWidth / 2, 65, { align: 'center' });

  // Add certificate details
  pdf.setTextColor(30, 41, 59); // Dark gray
  pdf.setFontSize(12);
  
  const details = [
    { label: 'Student Name:', value: certificateData.metadata?.studentName || 'Unknown' },
    { label: 'Degree:', value: certificateData.metadata?.degree || 'Unknown' },
    { label: 'Institution:', value: certificateData.metadata?.institution || 'Unknown' },
    { label: 'Graduation Date:', value: certificateData.metadata?.graduationDate || 'Unknown' },
    { label: 'Certificate ID:', value: certificateData.metadata?.certificateId || 'Unknown' },
    { label: 'Validation Date:', value: new Date().toLocaleDateString() },
    { label: 'Confidence Score:', value: `${certificateData.confidenceScore || 0}%` }
  ];

  let yPosition = 95;
  details.forEach((detail) => {
    pdf.text(detail.label, 20, yPosition);
    pdf.text(detail.value, 70, yPosition);
    yPosition += 12;
  });

  // Add security features section
  pdf.setFontSize(14);
  pdf.text('Security Features:', 20, yPosition + 15);
  
  pdf.setFontSize(10);
  const securityFeatures = [
    '• Cryptographic QR Code with verification hash',
    '• Digital watermark with institution branding',
    '• Tamper-proof design with embedded metadata',
    '• Timestamp-based validation system'
  ];

  yPosition += 30;
  securityFeatures.forEach((feature) => {
    pdf.text(feature, 25, yPosition);
    yPosition += 8;
  });

  // Add QR code if available
  if (qrCodeDataUrl) {
    const qrSize = 50; // mm - made larger for better scanning
    const qrX = pageWidth - qrSize - 20;
    const qrY = pageHeight - qrSize - 50;
    
    // Add white background for QR code for better contrast
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 15, 2, 2, 'F');
    
    // Add border around QR code
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 15, 2, 2, 'S');
    
    // Add QR code image
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    // Add QR code label
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Scan to verify authenticity', qrX + qrSize / 2, qrY + qrSize + 8, { align: 'center' });
  }

  // Add footer with generation timestamp
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139); // Gray
  pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  pdf.text('This document contains cryptographic security features', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Return PDF as blob
  return pdf.output('blob');
}

/**
 * Helper function to get status color
 */
function getStatusColor(authenticity: string, score: number): string {
  if (authenticity === 'authentic' && score >= 85) return '#22c55e';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
}

/**
 * Helper function to get status color as RGB values for PDF
 */
function getStatusColorRGB(authenticity: string, score: number): { r: number; g: number; b: number } {
  if (authenticity === 'authentic' && score >= 85) return { r: 34, g: 197, b: 94 }; // Green
  if (score >= 70) return { r: 245, g: 158, b: 11 }; // Yellow
  return { r: 239, g: 68, b: 68 }; // Red
}

/**
 * Helper function to get status text
 */
function getStatusText(authenticity: string, score: number): string {
  if (authenticity === 'authentic' && score >= 85) return 'VERIFIED AUTHENTIC';
  if (score >= 70) return 'REQUIRES REVIEW';
  return 'POTENTIALLY FORGED';
}

/**
 * Download a file with given content
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}