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
    const { data, error: err } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .order('name');
    if (err) throw err;
    return success(res, data, 'Users fetched');
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, listUsers };
