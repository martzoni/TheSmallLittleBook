import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Créer le contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {}
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Provider du contexte d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le stockage local au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Configurer l'en-tête d'autorisation pour toutes les requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;

        // Enregistrer dans le stockage local
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Mettre à jour l'état
        setToken(token);
        setUser(user);

        // Configurer l'en-tête d'autorisation pour toutes les requêtes
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;

        // Enregistrer dans le stockage local
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Mettre à jour l'état
        setToken(token);
        setUser(user);

        // Configurer l'en-tête d'autorisation pour toutes les requêtes
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer du stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Réinitialiser l'état
    setToken(null);
    setUser(null);

    // Supprimer l'en-tête d'autorisation
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
