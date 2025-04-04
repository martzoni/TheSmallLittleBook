const express = require('express');
const router = express.Router();
const associationController = require('../controllers/associationController');
const { authMiddleware } = require('../middlewares/auth');

// Toutes les routes utilisent le middleware d'authentification
router.use(authMiddleware);

// Routes pour les associations
router.get('/', associationController.getAssociations);
router.post('/', associationController.createAssociation);
router.get('/:id', associationController.getAssociationById);
router.put('/:id', associationController.updateAssociation);
router.put('/:id/categories', associationController.addCategory);

module.exports = router;
