const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @route   GET /api/enrollments/my
// @desc    Get courses assigned to logged in employee
// @access  Private (Learner)
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.user._id,
      companyId: req.user.companyId
    })
      .populate('courseId')
      .populate('campaignId', 'name startDate dueDate')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/enrollments/company
// @desc    Get all company enrollments
// @access  Private (Company Admin, Super Admin)
const getCompanyEnrollments = async (req, res, next) => {
  try {
    const companyId = req.tenantCompanyId || req.user.companyId;
    const { campaignId, status } = req.query;

    const query = { companyId };
    if (campaignId) query.campaignId = campaignId;
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate('userId', 'name email departmentId')
      .populate('courseId', 'title category estimatedDuration')
      .populate('campaignId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyEnrollments,
  getCompanyEnrollments
};
