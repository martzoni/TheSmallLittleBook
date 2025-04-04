const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authMiddleware } = require('../middlewares/auth');

// Routes protégées par l'authentification
router.use(authMiddleware);

// Routes pour les membres d'une association
router.get('/association/:associationId', memberController.getMembers);
router.post('/association/:associationId', memberController.addMember);
router.put('/:memberId', memberController.updateMember);
router.delete('/:memberId', memberController.deleteMember);

// Route publique pour accepter une invitation (ne nécessite pas d'authentification)
router.post('/invitation/:token', memberController.acceptInvitation);

module.exports = router;
