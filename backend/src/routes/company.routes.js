const express = require('express');
const router = express.Router();
const {
  getCompanies,
  createCompany,
  updateCompanyStatus,
  updateMyCompany
} = require('../controllers/company.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', authorize('SUPER_ADMIN', 'COMPANY_ADMIN'), getCompanies);
router.post('/', authorize('SUPER_ADMIN'), createCompany);
router.put('/:id/status', authorize('SUPER_ADMIN'), updateCompanyStatus);
router.put('/my-company', authorize('COMPANY_ADMIN'), updateMyCompany);

module.exports = router;
