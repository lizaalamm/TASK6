/**
 * backend/src/utils/apiResponse.js
 * ----------------------------------------------------------------------------
 * Standard envelope for EVERY API response so the frontend can rely on one
 * shape: `{ success, message, data, errors }`.
 * ----------------------------------------------------------------------------
 */

/**
 * Send a success response.
 * @param {import('express').Response} res - Express response.
 * @param {{status?:number,message?:string,data?:any}} opts - Overrides.
 * @returns The Express response (chainable).
 */
const success = (res, { status = 200, message = 'OK', data = null } = {}) => {
  return res.status(status).json({ success: true, message, data, errors: [] });
};

/**
 * Send an error response.
 * @param {import('express').Response} res - Express response.
 * @param {{status?:number,message?:string,errors?:any[]}} opts - Overrides.
 * @returns The Express response (chainable).
 */
const fail = (
  res,
  { status = 400, message = 'Request failed', errors = [] } = {}
) => {
  return res.status(status).json({ success: false, message, data: null, errors });
};

module.exports = { success, fail };
