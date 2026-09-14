const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/certificates/my
// @desc    Get certificates earned by logged in employee
// @access  Private (Learner)
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({
      userId: req.user._id,
      companyId: req.user.companyId
    }).sort({ issuedAt: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/certificates/company
// @desc    Get all certificates issued for the company
// @access  Private (Company Admin, Super Admin)
const getCompanyCertificates = async (req, res, next) => {
  try {
    const companyId = req.tenantCompanyId || req.user.companyId;
    const certificates = await Certificate.find({ companyId })
      .populate('userId', 'name email avatar')
      .sort({ issuedAt: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/certificates/verify/:certificateId
// @desc    PUBLIC endpoint to verify a certificate authenticity
// @access  Public (No Login Required)
const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({ certificateId });

    if (!cert) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: `No certificate found matching ID: ${certificateId}`
      });
    }

    const isValid = cert.status === 'VALID';

    // Return strictly non-sensitive, tamper-proof verification info
    res.json({
      success: true,
      isValid,
      certificate: {
        certificateId: cert.certificateId,
        recipientName: cert.recipientName,
        courseName: cert.courseName,
        companyName: cert.companyName,
        score: cert.score,
        issuedAt: cert.issuedAt,
        status: cert.status,
        revokedAt: cert.revokedAt,
        revokedReason: cert.revokedReason,
        verificationToken: cert.verificationToken,
        pdfUrl: cert.pdfUrl,
        qrCodeUrl: cert.qrCodeUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/certificates/:id/revoke
// @desc    Revoke an issued certificate
// @access  Private (Company Admin, Super Admin)
const revokeCertificate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const companyId = req.user.companyId;

    const query = req.user.role === 'SUPER_ADMIN'
      ? { _id: req.params.id }
      : { _id: req.params.id, companyId };

    const cert = await Certificate.findOne(query);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    cert.status = 'REVOKED';
    cert.revokedAt = new Date();
    cert.revokedReason = reason || 'Revoked by organizational compliance administrator';
    await cert.save();

    await AuditLog.create({
      companyId: cert.companyId,
      userId: req.user._id,
      action: 'CERTIFICATE_REVOKED',
      resource: 'Certificate',
      details: { certificateId: cert.certificateId, reason: cert.revokedReason }
    });

    res.json({
      success: true,
      message: `Certificate ${cert.certificateId} has been revoked`,
      certificate: cert
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyCertificates,
  getCompanyCertificates,
  verifyCertificate,
  revokeCertificate
};
