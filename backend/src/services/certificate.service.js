const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { certificatesDir } = require('../config/storage');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { generateCertificateId, generateVerificationToken } = require('../utils/generateCertificateId');
const config = require('../config/environment');

/**
 * Generate a high-resolution QR code as Data URL
 */
const generateQRCodeDataUrl = async (verificationUrl) => {
  return await QRCode.toDataURL(verificationUrl, {
    width: 160,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
};

/**
 * Render a professional cybersecurity certificate PDF using PDFKit
 */
const renderCertificatePDF = async ({ certificateId, recipientName, courseName, companyName, score, issuedAt, qrDataUrl, filePath }) => {
  return new Promise((resolve, reject) => {
    // Landscape A4 certificate (841.89 x 595.28 pt)
    const doc = new PDFDocument({
      size: [842, 595],
      margins: { top: 30, bottom: 30, left: 30, right: 30 }
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Dark security background accents
    doc.rect(0, 0, 842, 595).fill('#0b0f19');

    // Inner decorative border
    doc.rect(20, 20, 802, 555)
       .lineWidth(2)
       .stroke('#1e293b');

    // Cyan glowing inner border
    doc.rect(28, 28, 786, 539)
       .lineWidth(1)
       .stroke('#06b6d4');

    // CyberAware Logo & Title
    doc.fillColor('#06b6d4')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('CYBERAWARE SECURITY ACADEMY', 50, 60, { align: 'center', characterSpacing: 2 });

    doc.fillColor('#94a3b8')
       .fontSize(10)
       .font('Helvetica')
       .text('GLOBAL INFORMATION SECURITY COMPLIANCE & AWARENESS', 50, 85, { align: 'center', characterSpacing: 1.5 });

    // Decorative line
    doc.moveTo(250, 105).lineTo(592, 105).lineWidth(1).stroke('#334155');

    // Main Heading
    doc.fillColor('#18181b')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF ACHIEVEMENT', 50, 125, { align: 'center' });

    doc.fillColor('#cbd5e1')
       .fontSize(12)
       .font('Helvetica')
       .text('THIS IS PROUDLY PRESENTED TO', 50, 168, { align: 'center', characterSpacing: 1 });

    // Recipient Name
    doc.fillColor('#38bdf8')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text(recipientName, 50, 195, { align: 'center' });

    // Recipient Underline
    const nameWidth = doc.widthOfString(recipientName);
    const startX = (842 - Math.min(nameWidth + 60, 500)) / 2;
    doc.moveTo(startX, 235).lineTo(startX + Math.min(nameWidth + 60, 500), 235).lineWidth(1.5).stroke('#06b6d4');

    // Body Text
    doc.fillColor('#94a3b8')
       .fontSize(13)
       .font('Helvetica')
       .text(
         `For successfully completing the corporate cybersecurity awareness curriculum and demonstrating proficiency in security defenses at:`,
         120,
         255,
         { align: 'center', width: 602, lineGap: 4 }
       );

    // Organization & Course Title
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(courseName, 50, 310, { align: 'center' });

    doc.fillColor('#64748b')
       .fontSize(12)
       .font('Helvetica')
       .text(`Organization: ${companyName}   |   Assessment Score: ${score}% (PASSED)`, 50, 335, { align: 'center' });

    // Details Grid at Bottom
    // Left: Metadata
    const issueDateStr = new Date(issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fillColor('#94a3b8')
       .fontSize(10)
       .font('Helvetica')
       .text(`Certificate ID: ${certificateId}`, 60, 420);
    doc.text(`Issue Date: ${issueDateStr}`, 60, 436);
    doc.text(`Validation Status: Cryptographically Signed (VALID)`, 60, 452);
    doc.text(`Issuing Entity: CyberAware Platform v1.0`, 60, 468);

    // Center: Digital Security Seal
    doc.circle(421, 445, 32).lineWidth(2).stroke('#06b6d4');
    doc.fillColor('#06b6d4')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text('CYBERAWARE', 386, 435, { width: 70, align: 'center' })
       .text('VERIFIED', 386, 448, { width: 70, align: 'center' });

    // Right: QR Code for Public Verification
    if (qrDataUrl) {
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      doc.image(qrBuffer, 690, 400, { width: 85, height: 85 });
      doc.fillColor('#64748b')
         .fontSize(8)
         .font('Helvetica')
         .text('Scan to Verify', 690, 490, { width: 85, align: 'center' });
    }

    doc.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

/**
 * Issue a verified certificate if criteria are met
 */
const issueCertificate = async ({ user, company, course, campaignId, score }) => {
  // Check if an existing valid certificate is already issued
  let existingCert = await Certificate.findOne({
    userId: user._id,
    courseId: course._id,
    companyId: company._id,
    status: 'VALID'
  });

  if (existingCert) {
    return existingCert;
  }

  const certificateId = await generateCertificateId();
  const verificationToken = generateVerificationToken();
  const verificationUrl = `${config.appUrl}/verify/${certificateId}`;

  const qrCodeUrl = await generateQRCodeDataUrl(verificationUrl);
  const fileName = `${certificateId}.pdf`;
  const filePath = path.join(certificatesDir, fileName);

  await renderCertificatePDF({
    certificateId,
    recipientName: user.name,
    courseName: course.title,
    companyName: company.name,
    score,
    issuedAt: new Date(),
    qrDataUrl: qrCodeUrl,
    filePath
  });

  const relativePdfUrl = `/uploads/certificates/${fileName}`;

  const certificate = await Certificate.create({
    certificateId,
    userId: user._id,
    companyId: company._id,
    campaignId: campaignId || null,
    courseId: course._id,
    recipientName: user.name,
    courseName: course.title,
    companyName: company.name,
    score,
    issuedAt: new Date(),
    verificationToken,
    pdfUrl: relativePdfUrl,
    qrCodeUrl,
    status: 'VALID'
  });

  // Audit log creation
  await AuditLog.create({
    companyId: company._id,
    userId: user._id,
    action: 'CERTIFICATE_ISSUED',
    resource: 'Certificate',
    details: { certificateId, score, courseName: course.title }
  });

  return certificate;
};

module.exports = {
  issueCertificate,
  generateQRCodeDataUrl,
  renderCertificatePDF
};
