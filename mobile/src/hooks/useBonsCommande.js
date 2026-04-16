import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client.js';

export function useBonsCommande() {
  return useQuery({
    queryKey: ['bons-commande'],
    queryFn: () => api.get('/bons-commande').then((r) => r.data),
    staleTime: 10_000,
  });
}

export function useBonCommande(id) {
  return useQuery({
    queryKey: ['bons-commande', id],
    queryFn: () => api.get(`/bons-commande/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useConfirmerReception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, articlesRecus, lieuReception }) =>
      api
        .patch(`/bons-commande/${id}/reception`, { articlesRecus, lieuReception })
        .then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bons-commande'] });
      qc.invalidateQueries({ queryKey: ['bons-commande', id] });
    },
  });
}
