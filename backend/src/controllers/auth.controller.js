const User = require('../models/User');
const Company = require('../models/Company');
const Department = require('../models/Department');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('companyId', 'name slug logo status subscriptionPlan subscriptionStatus branding')
      .populate('departmentId', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
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
        avatar: user.avatar,
        jobTitle: user.jobTitle
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/register-company
// @desc    Register a new customer organization + company admin
// @access  Public
const registerCompany = async (req, res, next) => {
  try {
    const { companyName, email, password, adminName, industry, phone } = req.body;

    if (!companyName || !email || !password || !adminName) {
      return res.status(400).json({
        success: false,
        message: 'Company name, admin name, email, and password are required'
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

    const company = await Company.create({
      name: companyName,
      slug: finalSlug,
      email: email.toLowerCase(),
      phone: phone || '',
      industry: industry || 'Technology',
      status: 'ACTIVE',
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company,
        department: deptDocs[0],
        status: user.status
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
      .populate('companyId', 'name slug logo status branding')
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

module.exports = {
  login,
  registerCompany,
  refreshToken,
  getMe
};
