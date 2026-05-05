const { error } = require('../utils/apiResponse');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Unauthorized', 401);
  if (roles.includes(req.user.role)) return next();
  return error(res, 'Insufficient permissions', 403);
};

// Admin OR project_manager global role
const requirePMOrAdmin = (req, res, next) => {
  if (!req.user) return error(res, 'Unauthorized', 401);
  if (req.user.role === 'admin' || req.user.role === 'project_manager') return next();
  return error(res, 'Insufficient permissions', 403);
};

module.exports = { requireRole, requirePMOrAdmin };
