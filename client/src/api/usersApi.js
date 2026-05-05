export const usersApi = (api) => ({
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  listUsers: (q) => api.get('/users', { params: q ? { q } : {} }),
  searchUsers: (q) => api.get('/users/search', { params: { q } }),
  updateUserRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
});
