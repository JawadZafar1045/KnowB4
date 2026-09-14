const express = require('express');
const router = express.Router();
const { getMyEnrollments, getCompanyEnrollments } = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { tenantScope } = require('../middleware/tenant.middleware');

router.use(protect);

router.get('/my', getMyEnrollments);
router.get('/company', tenantScope, authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), getCompanyEnrollments);

module.exports = router;
