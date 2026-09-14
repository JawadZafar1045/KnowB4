const User = require('../models/User');
const Department = require('../models/Department');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { sendInvitationEmail } = require('../services/email.service');
const fs = require('fs');

// @route   GET /api/employees
// @desc    Get all employees for the company (with search & department filter)
// @access  Private (Company Admin, Super Admin)
const getEmployees = async (req, res, next) => {
  try {
    const companyId = req.tenantCompanyId || req.user.companyId;
    const { search, departmentId, status } = req.query;

    const query = { companyId, role: 'EMPLOYEE' };

    if (departmentId) {
      query.departmentId = departmentId;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await User.find(query)
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });

    // Enrich with enrollment summary
    const enriched = await Promise.all(
      employees.map(async (emp) => {
        const enrollments = await Enrollment.find({ userId: emp._id, companyId });
        const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
        const certificates = await Certificate.countDocuments({ userId: emp._id, companyId, status: 'VALID' });
        return {
          ...emp.toObject(),
          enrollmentCount: enrollments.length,
          completedCount: completed,
          certificatesCount: certificates
        };
      })
    );

    res.json({ success: true, count: enriched.length, employees: enriched });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/employees
// @desc    Create a new employee
// @access  Private (Company Admin)
const createEmployee = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { name, email, departmentId, jobTitle, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const initialPassword = password || 'WelcomeCyber2026!';
    const passwordHash = await User.hashPassword(initialPassword);

    const employee = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'EMPLOYEE',
      companyId,
      departmentId: departmentId || null,
      jobTitle: jobTitle || 'Team Member',
      status: 'ACTIVE'
    });

    await sendInvitationEmail({
      to: employee.email,
      name: employee.name,
      companyName: req.user.company?.name || 'Your Company',
      inviteLink: `${req.protocol}://${req.get('host')}/login`
    });

    await AuditLog.create({
      companyId,
      userId: req.user._id,
      action: 'EMPLOYEE_CREATED',
      resource: 'User',
      details: { employeeId: employee._id, email: employee.email }
    });

    res.status(201).json({ success: true, employee });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/employees/:id
// @desc    Update employee details
// @access  Private (Company Admin)
const updateEmployee = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { name, departmentId, jobTitle, status } = req.body;

    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, companyId, role: 'EMPLOYEE' },
      { name, departmentId, jobTitle, status },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, employee });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/employees/bulk-import
// @desc    Bulk import employees via CSV text or file upload
// @access  Private (Company Admin)
const bulkImportEmployees = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    let csvData = '';

    if (req.file) {
      csvData = fs.readFileSync(req.file.path, 'utf8');
      fs.unlinkSync(req.file.path); // clean up uploaded temp file
    } else if (req.body.csvText) {
      csvData = req.body.csvText;
    } else {
      return res.status(400).json({ success: false, message: 'CSV file or csvText required' });
    }

    // Parse CSV rows
    const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file must contain a header and at least one data row' });
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const nameIdx = header.indexOf('name');
    const emailIdx = header.indexOf('email');
    const deptIdx = header.indexOf('department');

    if (nameIdx === -1 || emailIdx === -1) {
      return res.status(400).json({ success: false, message: 'CSV must contain "name" and "email" columns' });
    }

    const createdEmployees = [];
    const skippedRows = [];

    // Pre-fetch departments for this company
    const existingDepts = await Department.find({ companyId });
    const deptMap = new Map();
    existingDepts.forEach(d => deptMap.set(d.name.toLowerCase(), d._id));

    const defaultPasswordHash = await User.hashPassword('WelcomeCyber2026!');

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const name = cols[nameIdx];
      const email = cols[emailIdx]?.toLowerCase();
      const deptName = deptIdx !== -1 ? cols[deptIdx] : '';

      if (!name || !email || !email.includes('@')) {
        skippedRows.push({ row: i, reason: 'Missing or invalid name/email', raw: lines[i] });
        continue;
      }

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        skippedRows.push({ row: i, reason: `Email ${email} already exists`, raw: lines[i] });
        continue;
      }

      let departmentId = null;
      if (deptName) {
        const lowerDept = deptName.toLowerCase();
        if (deptMap.has(lowerDept)) {
          departmentId = deptMap.get(lowerDept);
        } else {
          // Auto-create department for company
          const newDept = await Department.create({
            companyId,
            name: deptName,
            description: `${deptName} Department`
          });
          deptMap.set(lowerDept, newDept._id);
          departmentId = newDept._id;
        }
      }

      const emp = await User.create({
        name,
        email,
        passwordHash: defaultPasswordHash,
        role: 'EMPLOYEE',
        companyId,
        departmentId,
        status: 'ACTIVE'
      });

      createdEmployees.push({ id: emp._id, name: emp.name, email: emp.email });
    }

    await AuditLog.create({
      companyId,
      userId: req.user._id,
      action: 'EMPLOYEES_BULK_IMPORTED',
      resource: 'User',
      details: { importedCount: createdEmployees.length, skippedCount: skippedRows.length }
    });

    res.json({
      success: true,
      importedCount: createdEmployees.length,
      skippedCount: skippedRows.length,
      createdEmployees,
      skippedRows
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  bulkImportEmployees
};
