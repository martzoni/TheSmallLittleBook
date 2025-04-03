const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification pour protéger les routes
exports.authMiddleware = async (req, res, next) => {
  let token;

  // Vérifier si le token est dans les en-têtes
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extraire le token
    token = req.headers.authorization.split(' ')[1];
  }

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Veuillez vous connecter.'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Ajouter l'utilisateur à la requête
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification :', error);

    return res.status(401).json({
      success: false,
      message: 'Token invalide. Veuillez vous reconnecter.'
    });
  }
};
