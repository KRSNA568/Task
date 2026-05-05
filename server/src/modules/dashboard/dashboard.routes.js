const express = require('express');
const router = express.Router();
const ctrl = require('./dashboard.controller');
const verifyToken = require('../../middleware/verifyToken');

router.get('/stats', verifyToken, ctrl.getStats);
router.get('/my-tasks', verifyToken, ctrl.getMyTasks);

module.exports = router;
