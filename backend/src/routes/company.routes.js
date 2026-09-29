const express = require('express');
const router = express.Router();
const {
  getCompanies,
  createCompany,
  updateCompanyStatus,
  activateCompany,
  rejectCompany,
  getCompanyAdmins,
  updateAdminStatus,
  updateMyCompany
} = require('../controllers/company.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', authorize('SUPER_ADMIN', 'COMPANY_ADMIN'), getCompanies);
router.post('/', authorize('SUPER_ADMIN'), createCompany);
router.put('/:id/status', authorize('SUPER_ADMIN'), updateCompanyStatus);
router.put('/:id/activate', authorize('SUPER_ADMIN'), activateCompany);
router.put('/:id/reject', authorize('SUPER_ADMIN'), rejectCompany);
router.get('/:id/admins', authorize('SUPER_ADMIN'), getCompanyAdmins);
router.put('/:id/admins/:adminId/status', authorize('SUPER_ADMIN'), updateAdminStatus);
router.put('/my-company', authorize('COMPANY_ADMIN'), updateMyCompany);

module.exports = router;
