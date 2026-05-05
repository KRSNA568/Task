const supabase = require('../../config/supabase');
const { success, error } = require('../../utils/apiResponse');

const getMe = async (req, res, next) => {
  try {
    const { data, error: err } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();
    if (err) return error(res, 'User not found', 404);
    return success(res, data, 'Profile fetched');
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.name) allowed.name = req.body.name;
    if (req.body.avatar_url !== undefined) allowed.avatar_url = req.body.avatar_url;

    const { data, error: err } = await supabase
      .from('users')
      .update(allowed)
      .eq('id', req.user.id)
      .select('id, name, email, role, avatar_url, created_at')
      .single();
    if (err) throw err;
    return success(res, data, 'Profile updated');
  } catch (err) { next(err); }
};

const listUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    let query = supabase
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .order('name');
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data, error: err } = await query;
    if (err) throw err;
    return success(res, data, 'Users fetched');
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'project_manager', 'member'].includes(role))
      return error(res, 'Invalid role', 422);
    if (req.params.userId === req.user.id)
      return error(res, 'Cannot change your own role', 403);
    const { data, error: err } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.userId)
      .select('id, name, email, role, avatar_url, created_at')
      .single();
    if (err) throw err;
    return success(res, data, 'Role updated');
  } catch (err) { next(err); }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return success(res, [], 'Search results');
    const { data, error: err } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(10);
    if (err) throw err;
    return success(res, data, 'Search results');
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, listUsers, updateUserRole, searchUsers };
