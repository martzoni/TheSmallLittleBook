// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.css';
import { Flowbite } from "flowbite-react";

const App: React.FC = () => {
  console.log('App component is rendering...'); // Ajoutez ce log pour vérifier
  return (
    <AuthProvider>
      <Flowbite>
        <Router>
          <div className="bg-gray-50 dark:bg-gray-900">
            <div className="max-w-screen-xl mx-auto p-4 pt-20 min-h-screen pb-10">
              <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Routes privées */}
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<h1>Bienvenue sur la page principale</h1>} />
                </Route>
                {/* Redirection par défaut */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </Flowbite>
    </AuthProvider>
  );
};

export default App;
