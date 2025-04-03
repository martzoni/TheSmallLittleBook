// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà.'
      });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({ username, email, password });

    // Sauvegarder l'utilisateur (le mot de passe sera automatiquement haché)
    await newUser.save();

    // Générer un token JWT
    const token = generateToken(newUser._id);

    // Renvoyer les informations de l'utilisateur (sans le mot de passe) et le token
    res.status(201).json({
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = generateToken(user._id);

    // Renvoyer les informations de l'utilisateur et le token
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

// Route pour obtenir le profil utilisateur (protégée)
const auth = require('../middleware/auth');

router.get('/profile', auth, async (req, res) => {
  try {
    // L'utilisateur est déjà disponible grâce au middleware auth
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
});

module.exports = router;
