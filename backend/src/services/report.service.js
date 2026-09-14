const Company = require('../models/Company');
const User = require('../models/User');
const Course = require('../models/Course');
const Campaign = require('../models/Campaign');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const QuizAttempt = require('../models/QuizAttempt');
const Department = require('../models/Department');

/**
 * Super Admin Global Platform Analytics
 */
const getSuperAdminStats = async () => {
  const [
    totalCompanies,
    activeCompanies,
    totalEmployees,
    totalCourses,
    totalCampaigns,
    totalCertificates,
    totalEnrollments,
    completedEnrollments
  ] = await Promise.all([
    Company.countDocuments(),
    Company.countDocuments({ status: 'ACTIVE' }),
    User.countDocuments({ role: 'EMPLOYEE' }),
    Course.countDocuments(),
    Campaign.countDocuments(),
    Certificate.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'COMPLETED' })
  ]);

  const recentCompanies = await Company.find().sort({ createdAt: -1 }).limit(5);
  const recentCertificates = await Certificate.find({ status: 'VALID' }).sort({ issuedAt: -1 }).limit(5);

  return {
    totalCompanies,
    activeCompanies,
    totalEmployees,
    totalCourses,
    totalCampaigns,
    totalCertificates,
    totalEnrollments,
    completedEnrollments,
    platformCompletionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
    recentCompanies,
    recentCertificates
  };
};

/**
 * Company Admin Organization KPIs
 */
const getCompanyStats = async (companyId) => {
  const totalEmployees = await User.countDocuments({ companyId, role: 'EMPLOYEE' });
  const activeEmployees = await User.countDocuments({ companyId, role: 'EMPLOYEE', status: 'ACTIVE' });
  
  const enrollments = await Enrollment.find({ companyId });
  const totalEnrollments = enrollments.length;

  const now = new Date();
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let overdue = 0;

  enrollments.forEach(e => {
    if (e.status === 'COMPLETED') {
      completed++;
    } else if (e.dueDate && new Date(e.dueDate) < now) {
      overdue++;
    } else if (e.progressPercentage > 0) {
      inProgress++;
    } else {
      notStarted++;
    }
  });

  const completionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0;

  // Calculate average score across quiz attempts
  const attempts = await QuizAttempt.find({ companyId, passed: true });
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 85;

  const certificatesIssued = await Certificate.countDocuments({ companyId, status: 'VALID' });

  // Departmental breakdown
  const departments = await Department.find({ companyId });
  const departmentBreakdown = await Promise.all(
    departments.map(async (dept) => {
      const empCount = await User.countDocuments({ companyId, departmentId: dept._id });
      const deptUserIds = (await User.find({ companyId, departmentId: dept._id }).select('_id')).map(u => u._id);
      const deptEnrollments = await Enrollment.find({ companyId, userId: { $in: deptUserIds } });
      const deptCompleted = deptEnrollments.filter(e => e.status === 'COMPLETED').length;
      const deptRate = deptEnrollments.length > 0 ? Math.round((deptCompleted / deptEnrollments.length) * 100) : 0;

      return {
        departmentId: dept._id,
        name: dept.name,
        employeeCount: empCount,
        totalEnrollments: deptEnrollments.length,
        completedEnrollments: deptCompleted,
        completionRate: deptRate
      };
    })
  );

  return {
    totalEmployees,
    activeEmployees,
    totalEnrollments,
    completed,
    inProgress,
    notStarted,
    overdue,
    completionRate,
    averageScore: avgScore,
    certificatesIssued,
    departmentBreakdown
  };
};

/**
 * Employee Personal Learning Analytics
 */
const getEmployeeStats = async (userId, companyId) => {
  const enrollments = await Enrollment.find({ userId, companyId }).populate('courseId campaignId');
  const certificates = await Certificate.find({ userId, companyId, status: 'VALID' });

  const totalAssigned = enrollments.length;
  const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
  const inProgress = enrollments.filter(e => e.status === 'IN_PROGRESS').length;

  return {
    totalAssigned,
    completed,
    inProgress,
    completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
    certificatesCount: certificates.length,
    enrollments,
    certificates
  };
};

module.exports = {
  getSuperAdminStats,
  getCompanyStats,
  getEmployeeStats
};
