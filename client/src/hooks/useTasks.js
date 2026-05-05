import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useTasks(projectId) {
  const { tasks } = useApi();
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasks.getTasks(projectId).then((r) => r.data.data),
    enabled: !!projectId,
  });
}

export function useTask(projectId, taskId) {
  const { tasks } = useApi();
  return useQuery({
    queryKey: ['tasks', projectId, taskId],
    queryFn: () => tasks.getTask(projectId, taskId).then((r) => r.data.data),
    enabled: !!(projectId && taskId),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { tasks } = useApi();
  return useMutation({
    mutationFn: ({ projectId, ...data }) =>
      tasks.createTask(projectId, data).then((r) => r.data.data),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { tasks } = useApi();
  return useMutation({
    mutationFn: ({ projectId, taskId, ...data }) =>
      tasks.updateTask(projectId, taskId, data).then((r) => r.data.data),
    onSuccess: (task, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      qc.invalidateQueries({ queryKey: ['tasks', projectId, task.id] });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { tasks } = useApi();
  return useMutation({
    mutationFn: ({ projectId, taskId }) => tasks.deleteTask(projectId, taskId),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  const { tasks } = useApi();
  return useMutation({
    mutationFn: ({ projectId, taskId, body }) =>
      tasks.addComment(projectId, taskId, body).then((r) => r.data.data),
    onSuccess: (_, { projectId, taskId }) =>
      qc.invalidateQueries({ queryKey: ['tasks', projectId, taskId] }),
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  const { tasks } = useApi();
  return useMutation({
    mutationFn: ({ projectId, status, orderedIds }) =>
      tasks.reorderTasks(projectId, status, orderedIds),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}
