import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useProjects() {
  const { projects } = useApi();
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projects.getProjects().then((r) => r.data.data),
  });
}

export function useProject(id) {
  const { projects } = useApi();
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projects.getProject(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { projects } = useApi();
  return useMutation({
    mutationFn: (data) => projects.createProject(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { projects } = useApi();
  return useMutation({
    mutationFn: ({ id, ...data }) => projects.updateProject(id, data).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const { projects } = useApi();
  return useMutation({
    mutationFn: (id) => projects.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  const { projects } = useApi();
  return useMutation({
    mutationFn: ({ projectId, ...data }) => projects.addMember(projectId, data),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  const { projects } = useApi();
  return useMutation({
    mutationFn: ({ projectId, userId }) => projects.removeMember(projectId, userId),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}
