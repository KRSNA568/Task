export const tasksApi = (api) => ({
  getTasks: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getTask: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  addComment: (projectId, taskId, body) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { body }),
  createSubtask: (projectId, taskId, data) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/subtasks`, data),
  reorderTasks: (projectId, status, orderedIds) =>
    api.post(`/projects/${projectId}/tasks/reorder`, { status, orderedIds }),
});
