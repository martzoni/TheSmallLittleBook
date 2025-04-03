// frontend/src/services/todoService.ts
import axios from 'axios';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

// Fonction pour configurer le token d'authentification
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
