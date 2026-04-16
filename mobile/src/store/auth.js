import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client.js';

const TOKEN_KEY = 'suivi_bc_token';

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  hydrated: false,

  // Charger le token depuis SecureStore au démarrage
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        set({ token, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  setAuth: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    set({ token, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    set({ token: null, user: null });
  },
}));
