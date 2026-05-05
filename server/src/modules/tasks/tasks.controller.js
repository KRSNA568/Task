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
    await logActivity(req.params.projectId, req.user.id, 'task.created', { title: task.title }, task.id);
    return success(res, task, 'Task created', 201);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params;
    const meta = await svc.getTaskMeta(taskId);

    const isGlobalAdmin = req.user.role === 'admin';
    const isPM = req.projectRole === 'manager' || req.projectRole === 'admin';
    const isOwner = meta.created_by === req.user.id || meta.assigned_to === req.user.id;

    // Members can only edit tasks they own (created or assigned) and only certain fields
    if (!isGlobalAdmin && !isPM) {
      if (!isOwner)
        return error(res, 'You can only edit your own tasks', 403);
      const allowedFields = ['status', 'description', 'due_date', 'order_index'];
      const forbidden = Object.keys(req.body).filter((f) => !allowedFields.includes(f));
      if (forbidden.length > 0)
        return error(res, 'Members can only update status, description and due date', 403);
    }

    const task = await svc.updateTask(taskId, req.body);
    const action = req.body.status ? 'task.status_changed' : 'task.updated';
    await logActivity(projectId, req.user.id, action, req.body, taskId);
    return success(res, task, 'Task updated');
  } catch (err) { next(err); }
};

const reorderTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, orderedIds } = req.body;
    await svc.reorderTasks(projectId, status, orderedIds);
    return success(res, null, 'Tasks reordered');
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params;
    const meta = await svc.getTaskMeta(taskId);

    const isGlobalAdmin = req.user.role === 'admin';
    const isPM = req.projectRole === 'manager' || req.projectRole === 'admin';
    const isTaskCreator = meta.created_by === req.user.id;

    if (!isGlobalAdmin && !isPM && !isTaskCreator)
      return error(res, 'Cannot delete this task', 403);

    await svc.deleteTask(taskId);
    return success(res, null, 'Task deleted');
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { body } = req.body;
    if (!body?.trim()) return error(res, 'Comment body required', 422);
    const comment = await svc.addComment(projectId, taskId, req.user.id, body.trim());
    return success(res, comment, 'Comment added', 201);
  } catch (err) { next(err); }
};

const createSubtask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const subtask = await svc.createSubtask(projectId, taskId, req.body, req.user.id);
    return success(res, subtask, 'Subtask created', 201);
  } catch (err) { next(err); }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, reorderTasks, deleteTask, addComment, createSubtask };
