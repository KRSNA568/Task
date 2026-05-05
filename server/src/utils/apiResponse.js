const success = (res, data, message = 'OK', statusCode = 200, pagination = null) => {
  const body = { success: true, data, message };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

const error = (res, message = 'Internal Server Error', statusCode = 500, data = null) => {
  return res.status(statusCode).json({ success: false, data, message });
};

module.exports = { success, error };
