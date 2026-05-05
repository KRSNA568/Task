const svc = require('./tasks.service');
const { logActivity } = require('../projects/projects.service');
const { success, error } = require('../../utils/apiResponse');

const getTasks = async (req, res, next) => {
  try {
    const tasks = await svc.getTasks(req.params.projectId, req.query);
    return success(res, tasks, 'Tasks fetched');
  } catch (err) { next(err); }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await svc.getTaskById(req.params.projectId, req.params.taskId);
    if (!task) return error(res, 'Task not found', 404);
    return success(res, task, 'Task fetched');
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const task = await svc.createTask(req.params.projectId, req.body, req.user.id);
    await logActivity(req.params.projectId, req.user.id, 'task.created', { taskId: task.id, title: task.title });
    return success(res, task, 'Task created', 201);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params;
    const meta = await svc.getTaskMeta(taskId);

    const isGlobalAdmin = req.user.role === 'admin';
    const isProjectAdmin = req.projectRole === 'admin';
    const isAssignee = meta.created_by === req.user.id;

    // Members can only update status of tasks; admins can update anything
    if (!isGlobalAdmin && !isProjectAdmin) {
      const allowedFields = ['status'];
      const requestedFields = Object.keys(req.body);
      const forbidden = requestedFields.filter((f) => !allowedFields.includes(f));
      if (forbidden.length > 0)
        return error(res, 'Members can only update task status', 403);
    }

    const task = await svc.updateTask(taskId, req.body);
    if (req.body.status) {
      await logActivity(projectId, req.user.id, 'task.status_changed', { taskId, status: req.body.status });
    } else {
      await logActivity(projectId, req.user.id, 'task.updated', { taskId });
    }
    return success(res, task, 'Task updated');
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params;
    const meta = await svc.getTaskMeta(taskId);

    const isGlobalAdmin = req.user.role === 'admin';
    const isProjectAdmin = req.projectRole === 'admin';
    const isTaskOwner = meta.created_by === req.user.id;

    if (!isGlobalAdmin && !isProjectAdmin && !isTaskOwner)
      return error(res, 'Cannot delete this task', 403);

    await svc.deleteTask(taskId);
    await logActivity(projectId, req.user.id, 'task.deleted', { taskId });
    return success(res, null, 'Task deleted');
  } catch (err) { next(err); }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
