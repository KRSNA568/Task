export const usersApi = (api) => ({
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  listUsers: () => api.get('/users'),
});
