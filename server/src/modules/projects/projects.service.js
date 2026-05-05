const supabase = require('../../config/supabase');

const PROJECT_SELECT = `
  *,
  owner:owner_id(id, name, email, avatar_url),
  members:project_members(id, role, joined_at, user:user_id(id, name, email, avatar_url, role))
`;

const enrichProject = (p) => {
  const members = (p.members || []).map((m) => ({
    ...m.user,
    project_role: m.role,
    joined_at: m.joined_at,
    membership_id: m.id,
  }));
  const taskCount = p.task_count || 0;
  const doneCount = p.done_count || 0;
  return { ...p, members, task_count: taskCount, done_count: doneCount };
};

const getProjects = async (userId, userRole) => {
  let projectIds = null;

  if (userRole !== 'admin') {
    const { data: memberRows, error: me } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId);
    if (me) throw me;
    projectIds = (memberRows || []).map((m) => m.project_id);
    if (!projectIds.length) return [];
  }

  let query = supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('created_at', { ascending: false });

  if (projectIds) query = query.in('id', projectIds);

  const { data, error } = await query;
  if (error) throw error;

  // Compute task counts per project
  const ids = (data || []).map((p) => p.id);
  const { data: taskRows } = await supabase
    .from('tasks')
    .select('project_id, status')
    .in('project_id', ids)
    .is('parent_task_id', null);

  const counts = {};
  (taskRows || []).forEach((t) => {
    if (!counts[t.project_id]) counts[t.project_id] = { total: 0, done: 0 };
    counts[t.project_id].total++;
    if (t.status === 'done') counts[t.project_id].done++;
  });

  return (data || []).map((p) => ({
    ...enrichProject(p),
    task_count: counts[p.id]?.total || 0,
    done_count: counts[p.id]?.done || 0,
  }));
};

const getProjectById = async (projectId) => {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', projectId)
    .single();
  if (error) throw error;

  const { data: taskRows } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', projectId)
    .is('parent_task_id', null);

  const task_count = (taskRows || []).length;
  const done_count = (taskRows || []).filter((t) => t.status === 'done').length;
  return { ...enrichProject(data), task_count, done_count };
};

const createProject = async ({ name, description, status, due_date, key, color }, ownerId) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name, description, status, due_date, key, color: color || '#6366F1', owner_id: ownerId })
    .select()
    .single();
  if (error) throw error;

  // Creator becomes project manager
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: ownerId,
    role: 'manager',
  });

  return project;
};

const updateProject = async (projectId, updates) => {
  const allowed = ['name', 'description', 'status', 'due_date', 'color'];
  const patch = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteProject = async (projectId) => {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw error;
};

const addMember = async (projectId, userId, role = 'member') => {
  const validRoles = ['member', 'manager'];
  const safeRole = validRoles.includes(role) ? role : 'member';
  const { data, error } = await supabase
    .from('project_members')
    .upsert(
      { project_id: projectId, user_id: userId, role: safeRole },
      { onConflict: 'project_id,user_id' }
    )
    .select(`id, role, joined_at, user:user_id(id, name, email, avatar_url, role)`)
    .single();
  if (error) throw error;
  return { ...data.user, project_role: data.role, joined_at: data.joined_at, membership_id: data.id };
};

const removeMember = async (projectId, userId) => {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);
  if (error) throw error;
};

const logActivity = async (projectId, userId, action, meta = {}, taskId = null) => {
  const row = { project_id: projectId, user_id: userId, action, meta };
  if (taskId) row.task_id = taskId;
  await supabase.from('activity_logs').insert(row);
};

module.exports = {
  getProjects, getProjectById, createProject, updateProject,
  deleteProject, addMember, removeMember, logActivity,
};
