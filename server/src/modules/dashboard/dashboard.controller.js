const supabase = require('../../config/supabase');
const { success } = require('../../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const today = new Date().toISOString().split('T')[0];

    // Get project IDs accessible to this user
    let projectIds = [];
    if (isAdmin) {
      const { data } = await supabase.from('projects').select('id');
      projectIds = (data || []).map((p) => p.id);
    } else {
      const { data } = await supabase.from('project_members').select('project_id').eq('user_id', userId);
      projectIds = (data || []).map((m) => m.project_id);
    }

    if (!projectIds.length) {
      return success(res, { total: 0, todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0, projectCount: 0 }, 'Stats fetched');
    }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, due_date')
      .in('project_id', projectIds);

    const all = tasks || [];
    const stats = {
      projectCount: projectIds.length,
      total: all.length,
      todo: all.filter((t) => t.status === 'todo').length,
      in_progress: all.filter((t) => t.status === 'in_progress').length,
      review: all.filter((t) => t.status === 'review').length,
      done: all.filter((t) => t.status === 'done').length,
      overdue: all.filter((t) => t.due_date && t.due_date < today && t.status !== 'done').length,
    };

    return success(res, stats, 'Stats fetched');
  } catch (err) { next(err); }
};

const getMyTasks = async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`*, project:project_id(id, name), assignee:assigned_to(id, name, avatar_url), creator:created_by(id, name, avatar_url)`)
      .eq('assigned_to', req.user.id)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return success(res, tasks || [], 'My tasks fetched');
  } catch (err) { next(err); }
};

module.exports = { getStats, getMyTasks };
