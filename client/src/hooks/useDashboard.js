import { useQuery } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useStats() {
  const { dashboard } = useApi();
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => dashboard.getStats().then((r) => r.data.data),
  });
}

export function useMyTasks() {
  const { dashboard } = useApi();
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => dashboard.getMyTasks().then((r) => r.data.data),
  });
}
