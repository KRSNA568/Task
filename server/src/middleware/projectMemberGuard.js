const supabase = require('../config/supabase');

const requireProjectMember = (allowedRoles = ['member', 'admin']) =>
  async (req, res, next) => {
    // Global admins bypass project-level checks
    if (req.user.role === 'admin') return next();

    const { projectId } = req.params;
    const { data, error } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data)
      return res.status(403).json({ success: false, message: 'Not a project member' });

    if (!allowedRoles.includes(data.role))
      return res.status(403).json({ success: false, message: 'Insufficient project role' });

    req.projectRole = data.role;
    next();
  };

module.exports = { requireProjectMember };
