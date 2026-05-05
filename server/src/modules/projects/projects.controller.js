const svc = require('./projects.service');
const { success, error } = require('../../utils/apiResponse');

const getProjects = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const projects = await svc.getProjects(req.user.id, isAdmin);
    return success(res, projects, 'Projects fetched');
  } catch (err) { next(err); }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await svc.getProjectById(req.params.projectId);
    if (!project) return error(res, 'Project not found', 404);
    return success(res, project, 'Project fetched');
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const project = await svc.createProject(req.body, req.user.id);
    await svc.logActivity(project.id, req.user.id, 'project.created', { name: project.name });
    return success(res, project, 'Project created', 201);
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await svc.updateProject(req.params.projectId, req.body);
    await svc.logActivity(req.params.projectId, req.user.id, 'project.updated', req.body);
    return success(res, project, 'Project updated');
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    await svc.deleteProject(req.params.projectId);
    return success(res, null, 'Project deleted');
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const member = await svc.addMember(req.params.projectId, userId, role || 'member');
    await svc.logActivity(req.params.projectId, req.user.id, 'member.added', { userId, role });
    return success(res, member, 'Member added', 201);
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    await svc.removeMember(req.params.projectId, req.params.uid);
    await svc.logActivity(req.params.projectId, req.user.id, 'member.removed', { userId: req.params.uid });
    return success(res, null, 'Member removed');
  } catch (err) { next(err); }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, addMember, removeMember };
