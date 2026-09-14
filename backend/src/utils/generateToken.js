const jwt = require('jsonwebtoken');
const config = require('../config/environment');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpire }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
