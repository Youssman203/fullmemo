const express = require('express');
const {
  createSharedLink,
  getSharedCollection,
  downloadSharedCollection,
  getUserSharedLinks,
  deactivateSharedLink
} = require('../controllers/sharedLinkController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes pour la gestion des liens partagés (protection requise)
router.use('/manage', protect);

// Créer un lien partagé pour une collection
router.post('/collections/:collectionId', protect, createSharedLink);

// Récupérer tous les liens partagés de l'utilisateur connecté
router.get('/manage', getUserSharedLinks);

// Désactiver un lien partagé
router.delete('/manage/:linkId', deactivateSharedLink);

// Routes publiques pour accéder aux liens partagés
// Récupérer une collection via token partagé (accès public ou avec auth optionnel)
router.get('/:token', optionalProtect, getSharedCollection);

// Télécharger/Copier une collection via token partagé
router.post('/:token/download', optionalProtect, downloadSharedCollection);

module.exports = router;
