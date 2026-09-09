/**
 * backend/src/middleware/errorMiddleware.js
 * ----------------------------------------------------------------------------
 * Central error handling — mounted LAST in app.js so every thrown error and
 * every unmatched route funnels through here and leaves as the standard
 * `{ success:false, message, data:null, errors }` envelope.
 * ----------------------------------------------------------------------------
 */
const { fail } = require('../utils/apiResponse');

/**
 * 404 catcher for unknown routes. Forwards a "Not found" error so the
 * `errorHandler` below formats it like any other failure.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Translate known error types into clean client responses:
 *  - SequelizeUniqueConstraintError → 409 duplicate value
 *  - SequelizeValidationError       → 400 model validation failed
 *  - JsonWebTokenError/Expired      → 401 bad token
 *  - anything else                  → forwarded status or 500
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Duplicate unique column (email / phone / cnic).
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors?.map((e) => e.path) || [];
    return fail(res, {
      status: 409,
      message: `Duplicate value for ${fields.join(', ') || 'a unique field'}`,
      errors: err.errors?.map((e) => e.message) || [],
    });
  }

  // Model-level validation (bad email / phone / cnic shape...).
  if (err.name === 'SequelizeValidationError') {
    return fail(res, {
      status: 400,
      message: 'Validation failed',
      errors: err.errors?.map((e) => e.message) || [err.message],
    });
  }

  // Bad / expired JWTs surface as 401, never 500.
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return fail(res, { status: 401, message: 'Invalid or expired token' });
  }

  // Default: respect a status set upstream (e.g. 404), else 500.
  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500;

  return fail(res, {
    status,
    message: err.message || 'Server error',
    errors: envSafeDetails(err),
  });
};

/**
 * Include stack traces ONLY in development — production stays silent.
 * @param {Error} err - The thrown error.
 * @returns {string[]} Stack lines in dev, empty array otherwise.
 */
const envSafeDetails = (err) => {
  if (process.env.NODE_ENV === 'development') {
    return [err.stack].filter(Boolean);
  }
  return [];
};

module.exports = { notFound, errorHandler };
