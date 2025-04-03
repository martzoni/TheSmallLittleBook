// frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    if (!email || !password) {
      setFormError('Tous les champs sont obligatoires.');
      return;
    }

    try {
      await login(email, password);
      // Si la connexion réussit, rediriger vers la page principale
      navigate('/');
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
      console.error('Erreur lors de la connexion:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>

      {(error || formError) && (
        <div className="error-message">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <p className="register-link">
        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;
