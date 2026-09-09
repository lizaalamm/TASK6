/**
 * backend/src/middleware/validateMiddleware.js
 * ----------------------------------------------------------------------------
 * Tail middleware for every express-validator chain: collects field errors
 * and short-circuits with a 400 response, or calls `next()` when clean.
 * ----------------------------------------------------------------------------
 */
const { validationResult } = require('express-validator');
const { fail } = require('../utils/apiResponse');

/**
 * Return 400 `{ field, message }[]` when validation failed, else continue.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, {
      status: 400,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = { validate };
