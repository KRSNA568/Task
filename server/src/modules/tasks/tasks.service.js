const supabase = require('../../config/supabase');

const getTasks = async (projectId, filters = {}) => {
  let query = supabase
    .from('tasks')
    .select(`*, assignee:assigned_to(id, name, email, avatar_url), creator:created_by(id, name, email, avatar_url)`)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
  if (filters.overdue === 'true') {
    query = query.lt('due_date', new Date().toISOString().split('T')[0]).neq('status', 'done');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const getTaskById = async (projectId, taskId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`*, assignee:assigned_to(id, name, email, avatar_url), creator:created_by(id, name, email, avatar_url)`)
    .eq('id', taskId)
    .eq('project_id', projectId)
    .single();
  if (error) throw error;
  return data;
};

const createTask = async (projectId, taskData, createdBy) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, project_id: projectId, created_by: createdBy })
    .select(`*, assignee:assigned_to(id, name, email, avatar_url), creator:created_by(id, name, email, avatar_url)`)
    .single();
  if (error) throw error;
  return data;
};

const updateTask = async (taskId, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select(`*, assignee:assigned_to(id, name, email, avatar_url), creator:created_by(id, name, email, avatar_url)`)
    .single();
  if (error) throw error;
  return data;
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

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getTaskMeta };
