import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Injecter le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('suivi-bc-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// Déconnecter si 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('suivi-bc-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
