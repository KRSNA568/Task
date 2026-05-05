import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { createApiClient } from '../api/axios';
import { projectsApi } from '../api/projectsApi';
import { tasksApi } from '../api/tasksApi';
import { dashboardApi } from '../api/dashboardApi';
import { usersApi } from '../api/usersApi';

export function useApi() {
  const { tokenRef, logout } = useAuth();

  const api = useMemo(
    () => createApiClient(tokenRef, logout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return useMemo(
    () => ({
      raw: api,
      projects: projectsApi(api),
      tasks: tasksApi(api),
      dashboard: dashboardApi(api),
      users: usersApi(api),
    }),
    [api]
  );
}
