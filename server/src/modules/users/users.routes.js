const express = require('express');
const router = express.Router();
const ctrl = require('./users.controller');
const verifyToken = require('../../middleware/verifyToken');
const { requireRole } = require('../../middleware/roleGuard');

router.get('/me', verifyToken, ctrl.getMe);
router.patch('/me', verifyToken, ctrl.updateMe);
router.get('/', verifyToken, requireRole('admin'), ctrl.listUsers);
router.get('/search', verifyToken, ctrl.searchUsers);
router.patch('/:userId/role', verifyToken, requireRole('admin'), ctrl.updateUserRole);

module.exports = router;
