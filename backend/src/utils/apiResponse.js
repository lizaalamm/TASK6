const success = (res, { status = 200, message = 'OK', data = null, extra = {} } = {}) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    errors: [],
    ...extra,
  });
};

const fail = (res, { status = 400, message = 'Request failed', errors = [], extra = {} } = {}) => {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
    ...extra,
  });
};

module.exports = { success, fail };
