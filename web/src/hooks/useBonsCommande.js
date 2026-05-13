import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchBonsCommande,
  createBonCommande,
  deleteBonCommande,
  receptionnerBase,
  mettreEnLivraison,
  confirmerLivraisonFinale,
} from '../api/bons-commande.js';

export function useBonsCommande() {
  return useQuery({
    queryKey: ['bons-commande'],
    queryFn: fetchBonsCommande,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useCreateBC(onSuccess, onError) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBonCommande,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['bons-commande'] });
      toast.success(`BC "${data.numero}" créé avec succès`);
      onSuccess?.();
    },
    onError: (err) => {
      if (onError) {
        onError(err);
      }
      // Toast uniquement pour les erreurs autres que doublon (géré inline)
      if (err.response?.status !== 409) {
        toast.error(err.response?.data?.error || 'Erreur lors de la création');
      }
    },
  });
}

export function useDeleteBC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBonCommande,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bons-commande'] });
      toast.success('BC supprimé');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    },
  });
}

function makeWorkflowMutation(mutationFn, successMsg) {
  return function useHook(onSuccess) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['bons-commande'] });
        toast.success(successMsg);
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Erreur');
      },
    });
  };
}

export const useReceptionnerBase     = makeWorkflowMutation(receptionnerBase,          '✅ Réception à la base enregistrée');
export const useMettreEnLivraison    = makeWorkflowMutation(mettreEnLivraison,         '🚚 Mis en livraison');
export const useLivraisonFinale      = makeWorkflowMutation(confirmerLivraisonFinale,  '✅ Livraison confirmée');
