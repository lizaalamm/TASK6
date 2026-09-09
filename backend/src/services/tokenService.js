/**
 * backend/src/services/tokenService.js
 * ----------------------------------------------------------------------------
 * JWT helpers: sign tokens on login/register, verify them in auth middleware,
 * and mirror the token into an httpOnly cookie so browsers get it for free.
 * ----------------------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a JWT for a user. Payload is intentionally tiny (id + email + role).
 * @param {User} user - Authenticated user instance.
 * @returns {string} Signed JWT.
 */
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

/**
 * Verify + decode a JWT. Throws when invalid or expired.
 * @param {string} token - Raw JWT.
 * @returns {{userId:number,email:string,userType:string}} Decoded payload.
 */
const verifyToken = (token) => jwt.verify(token, env.jwt.secret);

// Shared cookie flags: httpOnly (JS-proof) + strict in dev, cross-site in prod.
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/',
};

/**
 * Write the JWT into the `token` httpOnly cookie.
 * @param {import('express').Response} res - Express response.
 * @param {string} token - Signed JWT.
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

/**
 * Remove the `token` cookie (used on logout).
 * @param {import('express').Response} res - Express response.
 */
const clearTokenCookie = (res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
};

module.exports = {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
};
