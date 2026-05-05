import { useAuth } from '../context/AuthContext';

export function usePermissions(projectRole = null) {
  const { user } = useAuth();
  const globalRole = user?.role;

  const isAdmin = globalRole === 'admin';
  const isPM = globalRole === 'project_manager';
  const isProjectManager = projectRole === 'manager' || projectRole === 'admin';

  return {
    // Global
    canCreateProject: isAdmin || isPM,
    canDeleteProject: isAdmin,
    canManageUsers: isAdmin,
    canChangeUserRoles: isAdmin,

    // Project-level (needs projectRole context)
    canEditProject: isAdmin || isProjectManager,
    canAddProjectMembers: isAdmin || isProjectManager,
    canRemoveProjectMembers: isAdmin || isProjectManager,
    canCreateTask: isAdmin || isPM || !!user,  // any member can create tasks
    canManageAnyTask: isAdmin || isProjectManager,

    // Helpers
    isAdmin,
    isPM,
    isProjectManager,
    globalRole,
    projectRole,
  };
}
