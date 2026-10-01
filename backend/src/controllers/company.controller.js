const Company = require('../models/Company');
const User = require('../models/User');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/companies
// @desc    Get all companies (Super Admin) or current company (Company Admin)
// @access  Private (Super Admin / Company Admin)
const getCompanies = async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') {
      const companies = await Company.find().sort({ createdAt: -1 });
      
      // Enrich with employee count and admin info
      const enriched = await Promise.all(
        companies.map(async (c) => {
          const empCount = await User.countDocuments({ companyId: c._id });
          const admin = await User.findOne({ companyId: c._id, role: 'COMPANY_ADMIN' })
            .select('name email status lastLoginAt');
          return {
            ...c.toObject(),
            employeeCount: empCount,
            admin: admin ? {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              status: admin.status,
              lastLoginAt: admin.lastLoginAt
            } : null
          };
        })
      );

      return res.json({ success: true, count: enriched.length, companies: enriched });
    }

    // Company Admin gets own company
    const company = await Company.findById(req.user.companyId);
    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/companies
// @desc    Create a new organization (Super Admin)
// @access  Private (Super Admin)
const createCompany = async (req, res, next) => {
  try {
    const { name, email, phone, industry, subscriptionPlan } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existing = await Company.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const company = await Company.create({
      name,
      slug: finalSlug,
      email,
      phone,
      industry,
      subscriptionPlan: subscriptionPlan || 'PROFESSIONAL',
      status: 'ACTIVE',
      activatedAt: new Date(),
      activatedBy: req.user._id
    });

    // Default departments
    await Department.insertMany([
      { companyId: company._id, name: 'IT & Security' },
      { companyId: company._id, name: 'Operations' },
      { companyId: company._id, name: 'Sales & Marketing' }
    ]);

    await AuditLog.create({
      userId: req.user._id,
      companyId: company._id,
      action: 'COMPANY_CREATED',
      resource: 'Company',
      details: { companyName: name, plan: subscriptionPlan }
    });

    res.status(201).json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/companies/:id/status
// @desc    Update company status (ACTIVE, SUSPENDED, PENDING_APPROVAL)
// @access  Private (Super Admin)
const updateCompanyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await AuditLog.create({
      userId: req.user._id,
      companyId: company._id,
      action: 'COMPANY_STATUS_UPDATED',
      resource: 'Company',
      details: { newStatus: status }
    });

    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/companies/:id/activate
// @desc    Activate a pending company (approve registration)
// @access  Private (Super Admin)
const activateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (company.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: `Company is already ${company.status}. Only PENDING_APPROVAL companies can be activated.`
      });
    }

    company.status = 'ACTIVE';
    company.activatedAt = new Date();
    company.activatedBy = req.user._id;
    await company.save();

    await AuditLog.create({
      userId: req.user._id,
      companyId: company._id,
      action: 'COMPANY_ACTIVATED',
      resource: 'Company',
      details: { companyName: company.name, tenantId: company.tenantId }
    });

    res.json({
      success: true,
      message: `Organization "${company.name}" has been activated. Their admin can now login using Tenant ID: ${company.tenantId}`,
      company
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/companies/:id/reject
// @desc    Reject a pending company registration
// @access  Private (Super Admin)
const rejectCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (company.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: `Company is ${company.status}. Only PENDING_APPROVAL companies can be rejected.`
      });
    }

    company.status = 'SUSPENDED';
    await company.save();

    // Also suspend the admin user
    await User.updateMany(
      { companyId: company._id, role: 'COMPANY_ADMIN' },
      { status: 'SUSPENDED' }
    );

    await AuditLog.create({
      userId: req.user._id,
      companyId: company._id,
      action: 'COMPANY_REJECTED',
      resource: 'Company',
      details: { companyName: company.name, reason: req.body.reason || 'Registration rejected' }
    });

    res.json({
      success: true,
      message: `Organization "${company.name}" registration has been rejected.`,
      company
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/companies/:id/admins
// @desc    Get admin users for a specific company
// @access  Private (Super Admin)
const getCompanyAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({
      companyId: req.params.id,
      role: 'COMPANY_ADMIN'
    }).select('-passwordHash');

    res.json({ success: true, admins });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/companies/:id/admins/:adminId/status
// @desc    Update admin user status (activate/suspend)
// @access  Private (Super Admin)
const updateAdminStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const admin = await User.findOneAndUpdate(
      { _id: req.params.adminId, companyId: req.params.id, role: 'COMPANY_ADMIN' },
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await AuditLog.create({
      userId: req.user._id,
      companyId: req.params.id,
      action: 'ADMIN_STATUS_UPDATED',
      resource: 'User',
      details: { adminName: admin.name, newStatus: status }
    });

    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/companies/my-company
// @desc    Update own company branding and profile
// @access  Private (Company Admin)
const updateMyCompany = async (req, res, next) => {
  try {
    const { phone, website, address, branding } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { phone, website, address, branding },
      { new: true }
    );

    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanies,
  createCompany,
  updateCompanyStatus,
  activateCompany,
  rejectCompany,
  getCompanyAdmins,
  updateAdminStatus,
  updateMyCompany
};
