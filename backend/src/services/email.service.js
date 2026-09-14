/**
 * Transactional Email Service
 * In development / MVP, outputs clean simulated dispatch logs and can integrate with SMTP / Sendgrid
 */
const sendInvitationEmail = async ({ to, name, companyName, inviteLink }) => {
  console.log(`[CyberAware Mailer] ✉️ Invitation dispatched to ${to} (${name}) for ${companyName}`);
  console.log(`[CyberAware Mailer] Link: ${inviteLink}`);
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
