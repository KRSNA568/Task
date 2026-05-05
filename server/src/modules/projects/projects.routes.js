const express = require('express');
const router = express.Router();
const ctrl = require('./projects.controller');
const verifyToken = require('../../middleware/verifyToken');
const { requireRole } = require('../../middleware/roleGuard');
const { requireProjectMember } = require('../../middleware/projectMemberGuard');
const { validate } = require('../../middleware/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('./projects.schema');

router.get('/', verifyToken, ctrl.getProjects);
router.post('/', verifyToken, requireRole('admin'), validate(createProjectSchema), ctrl.createProject);
router.get('/:projectId', verifyToken, requireProjectMember(), ctrl.getProjectById);
router.patch('/:projectId', verifyToken, requireProjectMember(['admin']), validate(updateProjectSchema), ctrl.updateProject);
router.delete('/:projectId', verifyToken, requireRole('admin'), ctrl.deleteProject);
router.post('/:projectId/members', verifyToken, requireProjectMember(['admin']), validate(addMemberSchema), ctrl.addMember);
router.delete('/:projectId/members/:uid', verifyToken, requireProjectMember(['admin']), ctrl.removeMember);

module.exports = router;
