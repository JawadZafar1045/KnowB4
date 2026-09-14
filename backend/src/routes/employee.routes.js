const express = require('express');
const router = express.Router();
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  bulkImportEmployees
} = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { tenantScope } = require('../middleware/tenant.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);
router.use(tenantScope);

router.get('/', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), getEmployees);
router.post('/', authorize('COMPANY_ADMIN'), createEmployee);
router.put('/:id', authorize('COMPANY_ADMIN'), updateEmployee);
router.post('/bulk-import', authorize('COMPANY_ADMIN'), upload.single('file'), bulkImportEmployees);

module.exports = router;
