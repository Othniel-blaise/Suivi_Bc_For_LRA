import axios from 'axios';

// ⚠️ IMPORTANT : Remplacez 192.168.X.X par l'IP locale de votre PC
// Commande pour trouver votre IP : ipconfig (Windows) → "Adresse IPv4"
const BASE_URL = __DEV__
  ? 'http://192.168.1.184:3001/api'   // ← CHANGER ICI
  : 'https://api.votre-domaine.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});


export default api;
