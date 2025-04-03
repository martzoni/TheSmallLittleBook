const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const associationRoutes = require('./routes/associations');
const transactionRoutes = require('./routes/transactions');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/thesmalllittlebook', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connexion à MongoDB établie avec succès');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err.message);
    process.exit(1);
  });

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/transactions', transactionRoutes);

// Route pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Servir les fichiers statiques de React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : err.message
  });
});

// Définir le port
const PORT = process.env.BACKEND_PORT || 3000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
