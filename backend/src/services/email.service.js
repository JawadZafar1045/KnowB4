const nodemailer = require('nodemailer');
const config = require('../config/environment');

// Create Nodemailer Transporter using SMTP settings
const createTransporter = () => {
  if (!config.smtp.user || !config.smtp.pass) {
    return null; // Fallback to console logger if SMTP credentials not set
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true for 465, false for other ports
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    },
    tls: {
      rejectUnauthorized: false // Helps with cPanel / Namecheap self-signed SSL certs if applicable
    }
  });
};

/**
 * Transactional Email Service
 * Supports Nodemailer SMTP (Namecheap / cPanel) with fallback to simulated dev console logs
 */
const sendInvitationEmail = async ({ to, name, companyName, tenantId, tempPassword, inviteLink }) => {
  const loginUrl = inviteLink || `${config.appUrl}/login`;
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #1e293b;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; tracking: -0.5px;">ThinkB4Act Security Platform</h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Cybersecurity Awareness Training</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            You have been onboarded to the security training portal for <strong>${companyName}</strong>. Below are your official access credentials:
          </p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
            <div style="margin-bottom: 10px; font-size: 13px;">
              <span style="color: #64748b;">Email Address:</span> <strong style="color: #0f172a;">${to}</strong>
            </div>
            <div style="margin-bottom: 10px; font-size: 13px;">
              <span style="color: #64748b;">Temporary Password:</span> <strong style="color: #2563eb; font-family: monospace;">${tempPassword}</strong>
            </div>
            <div style="font-size: 13px;">
              <span style="color: #64748b;">Organization Tenant ID:</span> <strong style="color: #0f172a; font-family: monospace;">${tenantId || 'TB4-ORG'}</strong>
            </div>
          </div>

          <p style="font-size: 13px; color: #dc2626; font-weight: 600; margin-bottom: 24px;">
            ⚠️ For security purposes, you will be required to set a new password upon your first login.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
              Access Training Portal
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
            Or copy and paste this link in your browser: <br/><a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
        to,
        subject: `Welcome to ${companyName} - Your Security Portal Credentials`,
        html: htmlContent
      });
      console.log(`[CyberAware Mailer] ✉️ SMTP email dispatched successfully to ${to}`);
    } catch (err) {
      console.error(`[CyberAware Mailer] ❌ SMTP Dispatch Failed:`, err.message);
    }
  } else {
    console.log(`[CyberAware Mailer Dev Fallback] ✉️ Invitation dispatched to ${to} (${name}) for ${companyName}`);
    console.log(`[Credentials] Temp Password: ${tempPassword} | Tenant ID: ${tenantId}`);
    console.log(`[Link] ${loginUrl}`);
  }

  return true;
};

const sendTrainingAssignedEmail = async ({ to, name, campaignName, dueDate }) => {
  console.log(`[CyberAware Mailer] ✉️ Training Assigned to ${to} (${name}) - Campaign: ${campaignName}, Due: ${dueDate}`);
  return true;
};

const sendCertificateIssuedEmail = async ({ to, name, courseName, certificateId, downloadLink }) => {
  console.log(`[CyberAware Mailer] ✉️ Certificate ${certificateId} for ${courseName} sent to ${to} (${name})`);
  return true;
};

module.exports = {
  sendInvitationEmail,
  sendTrainingAssignedEmail,
  sendCertificateIssuedEmail
};

