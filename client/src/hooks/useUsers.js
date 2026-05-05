import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useMe() {
  const { users } = useApi();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => users.getMe().then((r) => r.data.data),
  });
}

export function useUsers(q) {
  const { users } = useApi();
  return useQuery({
    queryKey: ['users', q],
    queryFn: () => users.listUsers(q).then((r) => r.data.data),
  });
}

export function useSearchUsers(q) {
  const { users } = useApi();
  return useQuery({
    queryKey: ['users-search', q],
    queryFn: () => users.searchUsers(q).then((r) => r.data.data),
    enabled: !!q && q.length >= 2,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const { users } = useApi();
  return useMutation({
    mutationFn: (data) => users.updateMe(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  const { users } = useApi();
  return useMutation({
    mutationFn: ({ userId, role }) => users.updateUserRole(userId, role).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
