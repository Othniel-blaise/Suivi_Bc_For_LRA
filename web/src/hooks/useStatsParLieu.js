import { useQuery } from '@tanstack/react-query';
import api from '../api/client.js';

export function useStatsParLieu() {
  return useQuery({
    queryKey: ['stats', 'par-lieu'],
    queryFn: () => api.get('/bons-commande/stats/par-lieu').then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
