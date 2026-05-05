const supabase = require('../config/supabase');

// allowedRoles: project-level roles allowed. Pass [] to allow any member.
// Global admin always bypasses. Project managers bypass if they own the project.
const requireProjectMember = (allowedRoles = ['member', 'admin', 'manager']) =>
  async (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Global admin bypasses all project checks
    if (req.user.role === 'admin') {
      req.projectRole = 'admin';
      return next();
    }

    const { projectId } = req.params;
    const { data, error } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data)
      return res.status(403).json({ success: false, message: 'Not a project member' });

    if (allowedRoles.length && !allowedRoles.includes(data.role))
      return res.status(403).json({ success: false, message: 'Insufficient project role' });

    req.projectRole = data.role;
    next();
  };

module.exports = { requireProjectMember };
