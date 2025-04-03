// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  if (!import.meta.env.VITE_API_URL) {
    setError('API_URL is not defined. Please set VITE_API_URL in your environment variables.');
  }

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Configurer le header d'autorisation pour toutes les requêtes axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Récupérer le profil utilisateur
        const response = await axios.get(`${API_URL}/auth/profile`);

        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      const { token, user } = response.data;

      // Stocker le token dans le localStorage
      localStorage.setItem('token', token);

      // Configurer le header d'autorisation pour toutes les requêtes axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue lors de la connexion.';
      setError(message);
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });

      const { token, user } = response.data;

      // Stocker le token dans le localStorage
      localStorage.setItem('token', token);

      // Configurer le header d'autorisation pour toutes les requêtes axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.';
      setError(message);
      console.error('Erreur d\'inscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');

    // Supprimer le header d'autorisation
    delete axios.defaults.headers.common['Authorization'];

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
