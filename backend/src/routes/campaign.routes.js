const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaign.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { tenantScope } = require('../middleware/tenant.middleware');

router.use(protect);
router.use(tenantScope);

router.get('/', getCampaigns);
router.post('/', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), createCampaign);
router.put('/:id', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), updateCampaign);
router.delete('/:id', authorize('COMPANY_ADMIN', 'SUPER_ADMIN'), deleteCampaign);

module.exports = router;

