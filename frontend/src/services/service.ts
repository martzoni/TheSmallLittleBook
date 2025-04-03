// frontend/src/services/todoService.ts
import axios from 'axios';

// const API_URL = 'http://localhost:3000/api';

// Fonction pour configurer le token d'authentification
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
