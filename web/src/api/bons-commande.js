import api from './client.js';

export const fetchBonsCommande = () =>
  api.get('/bons-commande').then((r) => r.data);

export const fetchBonCommande = (id) =>
  api.get(`/bons-commande/${id}`).then((r) => r.data);

export const createBonCommande = (data) =>
  api.post('/bons-commande', data).then((r) => r.data);

export const deleteBonCommande = (id) =>
  api.delete(`/bons-commande/${id}`).then((r) => r.data);

export const confirmerReception = ({ id, articlesRecus }) =>
  api.patch(`/bons-commande/${id}/reception`, { articlesRecus }).then((r) => r.data);

export const receptionnerBase = ({ id, ...data }) =>
  api.patch(`/bons-commande/${id}/reception-base`, data).then((r) => r.data);

export const mettreEnLivraison = ({ id, ...data }) =>
  api.patch(`/bons-commande/${id}/mise-en-livraison`, data).then((r) => r.data);

export const confirmerLivraisonFinale = ({ id, ...data }) =>
  api.patch(`/bons-commande/${id}/livraison-finale`, data).then((r) => r.data);

export const login = (credentials) =>
  api.post('/auth/login', credentials).then((r) => r.data);
