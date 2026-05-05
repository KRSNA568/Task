const supabase = require('../../config/supabase');

const TASK_SELECT = `
  *,
  task_key,
  assignee:assigned_to(id, name, email, avatar_url),
  creator:created_by(id, name, email, avatar_url),
  project:project_id(id, name, key, color)
`;

const flattenTask = (t) => ({
  ...t,
  assignee_name: t.assignee?.name || null,
  assignee_email: t.assignee?.email || null,
  project_name: t.project?.name || null,
  project_key: t.project?.key || null,
  project_color: t.project?.color || null,
});

const getTasks = async (projectId, filters = {}) => {
  let query = supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('project_id', projectId)
    .is('parent_task_id', null)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
  if (filters.search) query = query.ilike('title', `%${filters.search}%`);
  if (filters.overdue === 'true') {
    query = query.lt('due_date', new Date().toISOString().split('T')[0]).neq('status', 'done');
  }

  const { data, error } = await query;
  if (error) throw error;

  // Get comment counts
  const taskIds = (data || []).map((t) => t.id);
  let commentCounts = {};
  if (taskIds.length > 0) {
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('task_id')
      .eq('action', 'comment')
      .in('task_id', taskIds);
    (logs || []).forEach((l) => {
      commentCounts[l.task_id] = (commentCounts[l.task_id] || 0) + 1;
    });
  }

  return (data || []).map((t) => ({
    ...flattenTask(t),
    comment_count: commentCounts[t.id] || 0,
  }));
};

const getTaskById = async (projectId, taskId) => {
  const [{ data: task, error }, { data: logs }] = await Promise.all([
    supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single(),
    supabase
      .from('activity_logs')
      .select('*, actor:user_id(id, name, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }),
  ]);
  if (error) throw error;

  // subtasks
  const { data: subtasks } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('parent_task_id', taskId)
    .order('created_at', { ascending: true });

  const activity = (logs || []).map((l) => ({
    ...l,
    actor_name: l.actor?.name || 'Unknown',
    body: l.body || l.action,
  }));

  return { ...flattenTask(task), activity, subtasks: (subtasks || []).map(flattenTask) };
};

const createTask = async (projectId, taskData, createdBy) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, project_id: projectId, created_by: createdBy })
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return flattenTask(data);
};

const updateTask = async (taskId, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return flattenTask(data);
};

const reorderTasks = async (projectId, status, orderedIds) => {
  const updates = orderedIds.map((id, idx) =>
    supabase.from('tasks').update({ order_index: idx }).eq('id', id).eq('project_id', projectId)
  );
  await Promise.all(updates);
};

const deleteTask = async (taskId) => {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
};

const getTaskMeta = async (taskId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, created_by, project_id')
    .eq('id', taskId)
    .single();
  if (error) throw error;
  return data;
};

const addComment = async (projectId, taskId, userId, body) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      project_id: projectId,
      task_id: taskId,
      user_id: userId,
      action: 'comment',
      body,
      meta: {},
    })
    .select('*, actor:user_id(id, name, avatar_url)')
    .single();
  if (error) throw error;
  return { ...data, actor_name: data.actor?.name, body: data.body };
};

const createSubtask = async (projectId, parentTaskId, taskData, createdBy) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, project_id: projectId, parent_task_id: parentTaskId, created_by: createdBy })
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return flattenTask(data);
};

module.exports = {
  getTasks, getTaskById, createTask, updateTask, reorderTasks,
  deleteTask, getTaskMeta, addComment, createSubtask,
};
