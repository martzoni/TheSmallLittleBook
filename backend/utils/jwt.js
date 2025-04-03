// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

// Utiliser une variable d'environnement pour la clé secrète
const JWT_SECRET = process.env.JWT_SECRET;

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Le token expire après 7 jours
  );
};

// Vérifier un token JWT
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, expired: false, id: decoded.id };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      id: null
    };
  }
};

module.exports = { generateToken, verifyToken };
