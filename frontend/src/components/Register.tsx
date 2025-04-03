// frontend/src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    if (!username || !email || !password || !confirmPassword) {
      setFormError('Tous les champs sont obligatoires.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Veuillez entrer un email valide.');
      return;
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      setFormError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      await register(username, email, password);
      // Si l'inscription réussit, rediriger vers la page principale
      navigate('/');
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  return (
    <div className="register-container">
      <h2>Inscription</h2>

      {(error || formError) && (
        <div className="error-message">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>

      <p className="login-link">
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;
