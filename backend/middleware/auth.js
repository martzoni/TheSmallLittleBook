// backend/middleware/auth.js
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Vérifier si le header d'autorisation existe
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const { valid, expired, id } = verifyToken(token);

    if (!valid) {
      return res.status(401).json({
        message: expired ? 'Session expirée. Veuillez vous reconnecter.' : 'Token invalide.'
      });
    }

    // Vérifier si l'utilisateur existe toujours dans la base de données
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    // Ajouter l'utilisateur à l'objet requête pour une utilisation ultérieure
    req.user = { id: user._id, username: user.username, email: user.email };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'authentification.' });
  }
};

module.exports = auth;
