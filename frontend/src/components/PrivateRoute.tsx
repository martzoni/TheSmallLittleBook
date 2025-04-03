// frontend/src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Si l'authentification est en cours de vérification, afficher un loader
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu de la route
  return <Outlet />;
};

export default PrivateRoute;
