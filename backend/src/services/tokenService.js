const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

const verifyToken = (token) => jwt.verify(token, env.jwt.secret);

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

const clearTokenCookie = (res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
};

module.exports = {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
};
