const tenantScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for tenant isolation'
    });
  }

  // Super Admin can inspect across tenants or scope to a specific company if provided
  if (req.user.role === 'SUPER_ADMIN') {
    req.tenantCompanyId = req.query.companyId || req.body.companyId || null;
    return next();
  }

  // For Company Admin and Employee, strictly isolate to their companyId from authenticated JWT
  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: User does not belong to any organization'
    });
  }

  req.tenantCompanyId = req.user.companyId;
  next();
};

module.exports = { tenantScope };
