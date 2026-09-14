const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { tenantScope } = require('../middleware/tenant.middleware');

router.use(protect);
router.use(tenantScope);

router.get('/', getDepartments);
router.post('/', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), createDepartment);
router.put('/:id', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), updateDepartment);
router.delete('/:id', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), deleteDepartment);

module.exports = router;
