const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/todos')
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
