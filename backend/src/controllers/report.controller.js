const reportService = require('../services/report.service');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/reports/super-admin
// @desc    Platform-wide analytics for Super Admin
// @access  Private (Super Admin)
const getSuperAdminReports = async (req, res, next) => {
  try {
    const stats = await reportService.getSuperAdminStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/company
// @desc    Organization-level KPIs & departmental analytics for Company Admin
// @access  Private (Company Admin, Super Admin)
const getCompanyReports = async (req, res, next) => {
  try {
    const companyId = req.tenantCompanyId || req.user.companyId;
    const stats = await reportService.getCompanyStats(companyId);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/employee
// @desc    Learner metrics for employee dashboard
// @access  Private (Employee)
const getEmployeeReports = async (req, res, next) => {
  try {
    const stats = await reportService.getEmployeeStats(req.user._id, req.user.companyId);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/audit-logs
// @desc    Get audit trail for compliance
// @access  Private (Company Admin, Super Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const query = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSuperAdminReports,
  getCompanyReports,
  getEmployeeReports,
  getAuditLogs
};
