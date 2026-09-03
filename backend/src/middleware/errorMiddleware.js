const { fail } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  const error = new Error(`Not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors?.map((e) => e.path) || [];
    return fail(res, {
      status: 409,
      message: `Duplicate value for ${fields.join(', ') || 'a unique field'}`,
      errors: err.errors?.map((e) => e.message) || [],
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return fail(res, {
      status: 400,
      message: 'Validation failed',
      errors: err.errors?.map((e) => e.message) || [err.message],
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return fail(res, { status: 401, message: 'Invalid or expired token' });
  }

  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500;

  return fail(res, {
    status,
    message: err.message || 'Server error',
    errors: envSafeDetails(err),
  });
};

const envSafeDetails = (err) => {
  if (process.env.NODE_ENV === 'development') {
    return [err.stack].filter(Boolean);
  }
  return [];
};

module.exports = { notFound, errorHandler };
