const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('./tasks.controller');
const verifyToken = require('../../middleware/verifyToken');
const { requireProjectMember } = require('../../middleware/projectMemberGuard');
const { validate } = require('../../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('./tasks.schema');

router.get('/:projectId/tasks', verifyToken, requireProjectMember(), ctrl.getTasks);
router.post('/:projectId/tasks', verifyToken, requireProjectMember(), validate(createTaskSchema), ctrl.createTask);
router.get('/:projectId/tasks/:taskId', verifyToken, requireProjectMember(), ctrl.getTaskById);
router.patch('/:projectId/tasks/:taskId', verifyToken, requireProjectMember(), validate(updateTaskSchema), ctrl.updateTask);
router.delete('/:projectId/tasks/:taskId', verifyToken, requireProjectMember(), ctrl.deleteTask);

module.exports = router;
