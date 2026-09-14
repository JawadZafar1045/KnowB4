require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'cyberaware_jwt_super_secret_key_2026_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'cyberaware_jwt_refresh_super_secret_key_2026',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cyberaware',
  appUrl: process.env.APP_URL || 'http://localhost:5173'
};
