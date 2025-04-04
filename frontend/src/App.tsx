import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AssociationList from './pages/AssociationList';
import AssociationDashboard from './pages/AssociationDashboard';
import CreateAssociation from './pages/CreateAssociation';
import EditAssociation from './pages/EditAssociation';
import NotFound from './pages/NotFound';

// Composant Layout
import Layout from './components/Layout';

// Route protégée qui nécessite une authentification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/associations" />} />
            <Route path="associations" element={<AssociationList />} />
            <Route path="associations/create" element={<CreateAssociation />} />
            <Route path="associations/:associationId" element={<AssociationDashboard />} />
            <Route path="associations/:associationId/edit" element={<EditAssociation />} />
          </Route>

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
