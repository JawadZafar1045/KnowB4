const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getCompanyCertificates,
  verifyCertificate,
  revokeCertificate
} = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { tenantScope } = require('../middleware/tenant.middleware');

// Public route for tamper-proof certificate verification (PR&AD Section 34)
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.get('/my', protect, getMyCertificates);
router.get('/company', protect, tenantScope, authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), getCompanyCertificates);
router.put('/:id/revoke', protect, tenantScope, authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), revokeCertificate);

module.exports = router;
