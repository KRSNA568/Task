import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useMe() {
  const { users } = useApi();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => users.getMe().then((r) => r.data.data),
  });
}

export function useUsers() {
  const { users } = useApi();
  return useQuery({
    queryKey: ['users'],
    queryFn: () => users.listUsers().then((r) => r.data.data),
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
