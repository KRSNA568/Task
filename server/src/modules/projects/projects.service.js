const supabase = require('../../config/supabase');

const getProjects = async (userId, isAdmin) => {
  if (isAdmin) {
    const { data, error } = await supabase
      .from('projects')
      .select(`*, owner:owner_id(id, name, email, avatar_url), project_members(count)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  const { data: memberRows, error: memberError } = await supabase
    .from('project_members')
    .select('project_id, role')
    .eq('user_id', userId);
  if (memberError) throw memberError;

  const projectIds = memberRows.map((m) => m.project_id);
  if (!projectIds.length) return [];

  const { data, error } = await supabase
    .from('projects')
    .select(`*, owner:owner_id(id, name, email, avatar_url), project_members(count)`)
    .in('id', projectIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const getProjectById = async (projectId) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      owner:owner_id(id, name, email, avatar_url),
      project_members(id, role, joined_at, user:user_id(id, name, email, avatar_url))
    `)
    .eq('id', projectId)
    .single();
  if (error) throw error;
  return data;
};

const createProject = async ({ name, description, status, due_date }, ownerId) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name, description, status, due_date, owner_id: ownerId })
    .select()
    .single();
  if (error) throw error;

  // Auto-add creator as project admin
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: ownerId,
    role: 'admin',
  });

  return project;
};

const updateProject = async (projectId, updates) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
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

const addMember = async (projectId, userId, role) => {
  const { data, error } = await supabase
    .from('project_members')
    .upsert({ project_id: projectId, user_id: userId, role }, { onConflict: 'project_id,user_id' })
    .select(`id, role, joined_at, user:user_id(id, name, email, avatar_url)`)
    .single();
  if (error) throw error;
  return data;
};

const removeMember = async (projectId, userId) => {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);
  if (error) throw error;
};

const logActivity = async (projectId, userId, action, meta = {}) => {
  await supabase.from('activity_logs').insert({ project_id: projectId, user_id: userId, action, meta });
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, addMember, removeMember, logActivity };
