const Campaign = require('../models/Campaign');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('../services/notification.service');
const { sendTrainingAssignedEmail } = require('../services/email.service');

// @route   GET /api/campaigns
// @desc    Get all campaigns for current company
// @access  Private
const getCampaigns = async (req, res, next) => {
  try {
    const companyId = req.tenantCompanyId || req.user.companyId;
    const campaigns = await Campaign.find({ companyId })
      .populate('courses', 'title category thumbnail difficulty estimatedDuration')
      .populate('targetDepartments', 'name')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      campaigns.map(async (c) => {
        const enrollments = await Enrollment.find({ campaignId: c._id });
        const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
        const total = enrollments.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...c.toObject(),
          enrollmentCount: total,
          completedCount: completed,
          completionRate
        };
      })
    );

    res.json({ success: true, count: enriched.length, campaigns: enriched });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/campaigns
// @desc    Create new campaign and automatically generate enrollments
// @access  Private (Company Admin)
const createCampaign = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { name, description, courses, targetType, targetDepartments, targetUsers, startDate, dueDate } = req.body;

    if (!name || !courses || courses.length === 0 || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name, at least one course, and due date are required'
      });
    }

    const campaign = await Campaign.create({
      companyId,
      name,
      description: description || '',
      courses,
      targetType: targetType || 'ALL_EMPLOYEES',
      targetDepartments: targetDepartments || [],
      targetUsers: targetUsers || [],
      startDate: startDate || new Date(),
      dueDate,
      createdBy: req.user._id,
      status: 'ACTIVE'
    });

    // Resolve target employee list
    let targetEmployeeIds = [];
    if (targetType === 'ALL_EMPLOYEES') {
      const allEmps = await User.find({ companyId, role: 'EMPLOYEE', status: 'ACTIVE' }).select('_id email name');
      targetEmployeeIds = allEmps;
    } else if (targetType === 'DEPARTMENT' && targetDepartments && targetDepartments.length > 0) {
      const deptEmps = await User.find({
        companyId,
        departmentId: { $in: targetDepartments },
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      }).select('_id email name');
      targetEmployeeIds = deptEmps;
    } else if (targetType === 'SELECTED_USERS' && targetUsers && targetUsers.length > 0) {
      const selectedEmps = await User.find({
        _id: { $in: targetUsers },
        companyId,
        role: 'EMPLOYEE'
      }).select('_id email name');
      targetEmployeeIds = selectedEmps;
    }

    // Batch generate enrollments for each employee and each course
    const enrollmentsToCreate = [];
    for (const emp of targetEmployeeIds) {
      for (const courseId of courses) {
        enrollmentsToCreate.push({
          companyId,
          userId: emp._id,
          campaignId: campaign._id,
          courseId,
          status: 'ASSIGNED',
          progressPercentage: 0,
          assignedAt: new Date(),
          dueDate
        });
      }

      // Notify employee
      await createNotification({
        userId: emp._id,
        companyId,
        title: 'New Security Training Assigned',
        message: `You have been enrolled in campaign "${campaign.name}". Please complete by ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'TRAINING_ASSIGNED',
        link: '/employee/training'
      });

      sendTrainingAssignedEmail({
        to: emp.email,
        name: emp.name,
        campaignName: campaign.name,
        dueDate: new Date(dueDate).toLocaleDateString()
      }).catch(console.error);
    }

    if (enrollmentsToCreate.length > 0) {
      await Enrollment.insertMany(enrollmentsToCreate, { ordered: false }).catch(err => {
        // Ignore duplicate key errors if already enrolled
        console.warn('[Campaign] Some enrollments may already exist:', err.message);
      });
    }

    await AuditLog.create({
      companyId,
      userId: req.user._id,
      action: 'CAMPAIGN_LAUNCHED',
      resource: 'Campaign',
      details: {
        campaignId: campaign._id,
        name: campaign.name,
        targetedEmployees: targetEmployeeIds.length,
        coursesCount: courses.length
      }
    });

    res.status(201).json({
      success: true,
      campaign,
      targetedEmployeesCount: targetEmployeeIds.length,
      enrollmentsCreated: enrollmentsToCreate.length
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCampaigns,
  createCampaign
};
