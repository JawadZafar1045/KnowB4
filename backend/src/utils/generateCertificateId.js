const Certificate = require('../models/Certificate');
const crypto = require('crypto');

const generateCertificateId = async () => {
  const year = new Date().getFullYear();
  const count = await Certificate.countDocuments();
  const sequence = String(count + 1).padStart(6, '0');
  let certId = `CA-${year}-${sequence}`;
  
  // Ensure absolute uniqueness
  const exists = await Certificate.findOne({ certificateId: certId });
  if (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    certId = `CA-${year}-${sequence}-${randomSuffix}`;
  }
  return certId;
};

const generateVerificationToken = () => {
  return crypto.randomBytes(24).toString('hex');
};

module.exports = {
  generateCertificateId,
  generateVerificationToken
};
