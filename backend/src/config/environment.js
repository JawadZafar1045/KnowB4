require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'cyberaware_jwt_super_secret_key_2026_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'cyberaware_jwt_refresh_super_secret_key_2026',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/knowb4',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  platformSecretKey: process.env.PLATFORM_SECRET_KEY || 'THINKB4ACT-2026-SECURE-REGISTER',
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@thinkb4act.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'ChangeThisPassword!2026'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || true,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'ThinkB4Act Platform',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@thinkb4act.com'
  }
};
