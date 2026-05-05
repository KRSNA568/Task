const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET } = require('../config/env');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_ACCESS_SECRET); // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

module.exports = verifyToken;
