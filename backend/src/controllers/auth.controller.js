const User = require('../models/User');
const Company = require('../models/Company');
const Department = require('../models/Department');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');


// Helper function to validate email format using Regular Expression (Regex)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens (supports optional tenantId for scoped login)
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Format Validation Check 
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format'
      });
    }

    // Build query — if tenantId is provided, scope the user lookup to that company
    let query = { email: email.toLowerCase() };

    if (tenantId) {
      const company = await Company.findOne({ tenantId: tenantId.toUpperCase().trim() });
      if (!company) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Tenant ID. Please check your organization identifier.'
        });
      }

      // Check if company is pending approval
      // if (company.status === 'PENDING_APPROVAL') {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Your organization is pending approval by the platform administrator. Please wait for activation.'
      //   });
      // }

      query.companyId = company._id;
    }

    const user = await User.findOne(query)
      .populate('companyId', 'name slug tenantId logo status subscriptionPlan subscriptionStatus branding')
      .populate('departmentId', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: tenantId ? 'Invalid credentials for this organization' : 'Invalid email or password'
      });
    }

    // Check if account is locked due to repeated failed attempts
    if (user.isLocked && user.isLocked()) {
      const unlockAt = user.lockUntil;
      return res.status(423).json({
        success: false,
        message: `Account locked due to multiple failed login attempts. Try again at ${unlockAt.toISOString()}`
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment failed attempts and possibly lock the account
      await user.incrementFailedLogin();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Successful login: reset failed attempts
    if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
      await user.resetFailedLogin();
    }
    
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact system administrator.`
      });
    }

    if (user.companyId && user.companyId.status === 'SUSPENDED' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Your organization account is suspended. Please contact platform support.'
      });
    }

    // Block login for non-super-admins if org is PENDING_APPROVAL
    if (user.companyId && user.companyId.status === 'PENDING_APPROVAL' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Your organization is pending approval. Please wait for platform administrator activation.'
      });
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.companyId,
        department: user.departmentId,
        status: user.status,
        requiresPasswordReset: !!user.requiresPasswordReset,
        avatar: user.avatar,
        jobTitle: user.jobTitle
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/change-password
// @desc    Change employee password (used during first login reset flow)
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.requiresPasswordReset = false;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/register-company
// @desc    Register a new customer organization + company admin (requires platform secret key)
// @access  Public
const registerCompany = async (req, res, next) => {
  try {
    const { companyName, email, password, adminName, industry, phone, secretKey } = req.body;

    // Validate secret key first
    if (!secretKey || secretKey.trim() !== config.platformSecretKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid platform registration key. Please contact the platform administrator to obtain a valid key.'
      });
    }

    if (!companyName || !email || !password || !adminName) {
      return res.status(400).json({
        success: false,
        message: 'Company name, admin name, email, and password are required'
      });
    }

    // Robust Security Checks (Email format & Password Strength)
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid administrator email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long for production security standards'
      });
    }

    if (companyName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be at least 2 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existingCompany = await Company.findOne({ slug });
    const finalSlug = existingCompany ? `${slug}-${Math.floor(100 + Math.random() * 900)}` : slug;

    // Company starts in PENDING_APPROVAL status — Super Admin must activate it
    const company = await Company.create({
      name: companyName,
      slug: finalSlug,
      email: email.toLowerCase(),
      phone: phone || '',
      industry: industry || 'Technology',
      status: 'PENDING_APPROVAL',
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'TRIAL'
    });

    // Create standard default departments
    const defaultDepartments = ['Security & IT', 'Human Resources', 'Finance', 'Engineering'];
    const deptDocs = await Department.insertMany(
      defaultDepartments.map(name => ({
        companyId: company._id,
        name,
        description: `${name} Department`
      }))
    );

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: adminName,
      email: email.toLowerCase(),
      passwordHash,
      role: 'COMPANY_ADMIN',
      companyId: company._id,
      departmentId: deptDocs[0]._id,
      status: 'ACTIVE',
      jobTitle: 'Company Administrator'
    });

    // Don't auto-login — return success with pending info
    res.status(201).json({
      success: true,
      message: 'Organization registered successfully! Your account is pending approval by the platform administrator. You will be able to login once your organization is activated.',
      tenantId: company.tenantId,
      company: {
        name: company.name,
        tenantId: company.tenantId,
        status: company.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/refresh-token
// @desc    Get new access token from refresh token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id)
      .populate('companyId', 'name slug tenantId logo status branding')
      .populate('departmentId', 'name');

    if (!user || user.status === 'SUSPENDED') {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('companyId')
      .populate('departmentId');

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};
// @route   POST /api/auth/logout
// @desc    Logout user & clear session
// @access  Private
const logout = async (req, res, next) => {
  try {
    // 1. Cookies clear 
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    // 2. success response 
    res.json({
      success: true,
      message: 'Logged out successfully. Backend session cleared.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  registerCompany,
  refreshToken,
  getMe,
  logout,
  changePassword
};
