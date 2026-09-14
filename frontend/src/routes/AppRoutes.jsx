import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import CompanyAdminLayout from '../layouts/CompanyAdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';

// Auth
import LoginPage from '../pages/auth/LoginPage';

// Super Admin
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import CompaniesManagement from '../pages/super-admin/CompaniesManagement';
import GlobalCourseManager from '../pages/super-admin/GlobalCourseManager';

// Company Admin
import CompanyDashboard from '../pages/company/CompanyDashboard';
import EmployeeManagement from '../pages/company/EmployeeManagement';
import DepartmentManagement from '../pages/company/DepartmentManagement';
import CampaignManagement from '../pages/company/CampaignManagement';
import TrainingReports from '../pages/company/TrainingReports';
import CompanyCertificates from '../pages/company/CompanyCertificates';
import AuditLogs from '../pages/company/AuditLogs';

// Employee
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import CoursePlayer from '../pages/employee/CoursePlayer';
import QuizPlayer from '../pages/employee/QuizPlayer';
import MyCertificates from '../pages/employee/MyCertificates';
import CourseCatalog from '../pages/employee/CourseCatalog';

// Public
import CertificateVerificationPage from '../pages/public/CertificateVerificationPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN') return '/super-admin';
    if (user.role === 'COMPANY_ADMIN') return '/company';
    return '/employee';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="companies" element={<CompaniesManagement />} />
          <Route path="courses" element={<GlobalCourseManager />} />
          <Route path="reports" element={<SuperAdminDashboard />} />
        </Route>

        {/* Company Admin Routes */}
        <Route path="/company" element={
          <ProtectedRoute roles={['COMPANY_ADMIN']}>
            <CompanyAdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CompanyDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="campaigns" element={<CampaignManagement />} />
          <Route path="reports" element={<TrainingReports />} />
          <Route path="certificates" element={<CompanyCertificates />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute roles={['EMPLOYEE']}>
            <EmployeeLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="course/:courseId" element={<CoursePlayer />} />
          <Route path="course/:courseId/quiz" element={<QuizPlayer />} />
          <Route path="certificates" element={<MyCertificates />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
