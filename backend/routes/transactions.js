const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionsController');
const { authMiddleware } = require('../middlewares/auth');

// Toutes les routes utilisent le middleware d'authentification
router.use(authMiddleware);

// Routes pour les transactions d'une association
router.get('/association/:associationId', transactionController.getTransactions);
router.post('/association/:associationId', transactionController.addTransaction);
router.put('/association/:associationId/:id', transactionController.updateTransaction);
router.delete('/association/:associationId/:id', transactionController.deleteTransaction);

// Route pour le résumé financier
router.get('/association/:associationId/summary', transactionController.getFinancialSummary);

module.exports = router;
