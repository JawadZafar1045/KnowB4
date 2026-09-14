const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/error.middleware');
const { uploadsDir } = require('./config/storage');

// Import routes
const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/company.routes');
const employeeRoutes = require('./routes/employee.routes');
const departmentRoutes = require('./routes/department.routes');
const courseRoutes = require('./routes/course.routes');
const quizRoutes = require('./routes/quiz.routes');
const campaignRoutes = require('./routes/campaign.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const progressRoutes = require('./routes/progress.routes');
const certificateRoutes = require('./routes/certificate.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads (certificates, media)
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CyberAware Multi-Tenant SaaS',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
