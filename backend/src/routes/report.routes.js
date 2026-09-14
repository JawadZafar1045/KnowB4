const express = require('express');
const router = express.Router();
const {
  getSuperAdminReports,
  getCompanyReports,
  getEmployeeReports,
  getAuditLogs
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { tenantScope } = require('../middleware/tenant.middleware');

router.use(protect);

router.get('/super-admin', authorize('SUPER_ADMIN'), getSuperAdminReports);
router.get('/company', tenantScope, authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), getCompanyReports);
router.get('/employee', getEmployeeReports);
router.get('/audit-logs', tenantScope, authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), getAuditLogs);

module.exports = router;
