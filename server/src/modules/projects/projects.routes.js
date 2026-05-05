const express = require('express');
const router = express.Router();
const ctrl = require('./projects.controller');
const verifyToken = require('../../middleware/verifyToken');
const { requireRole, requirePMOrAdmin } = require('../../middleware/roleGuard');
const { requireProjectMember } = require('../../middleware/projectMemberGuard');
const { validate } = require('../../middleware/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('./projects.schema');

// List — everyone sees their own projects
router.get('/', verifyToken, ctrl.getProjects);

// Create — admin or project_manager global role
router.post('/', verifyToken, requirePMOrAdmin, validate(createProjectSchema), ctrl.createProject);

// Single project — must be a member
router.get('/:projectId', verifyToken, requireProjectMember(), ctrl.getProjectById);

// Edit project — project manager or admin (project-level)
router.patch('/:projectId', verifyToken, requireProjectMember(['admin', 'manager']), validate(updateProjectSchema), ctrl.updateProject);

// Delete — global admin only
router.delete('/:projectId', verifyToken, requireRole('admin'), ctrl.deleteProject);

// Manage members — project manager or admin
router.post('/:projectId/members', verifyToken, requireProjectMember(['admin', 'manager']), validate(addMemberSchema), ctrl.addMember);
router.delete('/:projectId/members/:uid', verifyToken, requireProjectMember(['admin', 'manager']), ctrl.removeMember);

module.exports = router;
