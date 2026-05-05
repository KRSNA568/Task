export const dashboardApi = (api) => ({
  getStats: () => api.get('/dashboard/stats'),
  getMyTasks: () => api.get('/dashboard/my-tasks'),
});
