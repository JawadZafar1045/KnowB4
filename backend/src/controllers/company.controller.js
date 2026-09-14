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
      
      // Enrich with employee count
      const enriched = await Promise.all(
        companies.map(async (c) => {
          const empCount = await User.countDocuments({ companyId: c._id });
          return {
            ...c.toObject(),
            employeeCount: empCount
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
      status: 'ACTIVE'
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
// @desc    Update company status (ACTIVE, SUSPENDED)
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
  updateMyCompany
};
