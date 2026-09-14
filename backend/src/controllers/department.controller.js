const Department = require('../models/Department');
const User = require('../models/User');

// @route   GET /api/departments
// @desc    Get departments for the tenant
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const companyId = req.tenantCompanyId || req.user.companyId;
    const departments = await Department.find({ companyId }).sort({ name: 1 });

    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ companyId, departmentId: dept._id });
        return {
          ...dept.toObject(),
          employeeCount: count
        };
      })
    );

    res.json({ success: true, count: enriched.length, departments: enriched });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/departments
// @desc    Create department
// @access  Private (Company Admin)
const createDepartment = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const existing = await Department.findOne({ companyId, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A department with this name already exists' });
    }

    const department = await Department.create({
      companyId,
      name,
      description: description || ''
    });

    res.status(201).json({ success: true, department });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Company Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { name, description, status } = req.body;

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({ success: true, department });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Company Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const assignedEmployees = await User.countDocuments({ companyId, departmentId: req.params.id });
    if (assignedEmployees > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${assignedEmployees} assigned employees. Please reassign them first.`
      });
    }

    await Department.findOneAndDelete({ _id: req.params.id, companyId });
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
