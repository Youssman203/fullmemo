const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateShareCode,
  getCollectionByCode,
  importCollectionByCode,
  getUserShareCodes,
  deactivateShareCode
} = require('../controllers/collectionShareCodeController');

const router = express.Router();

// Routes pour la gestion des codes de partage

// Générer un code de partage pour une collection (protection requise)
router.post('/collections/:collectionId/generate', protect, generateShareCode);

// Accéder à une collection via un code (protection optionnelle)
router.get('/code/:code', protect, getCollectionByCode);

// Importer une collection via un code (protection requise)
router.post('/code/:code/import', protect, importCollectionByCode);

// Récupérer tous les codes de partage d'un utilisateur (protection requise)
router.get('/manage', protect, getUserShareCodes);

// Désactiver un code de partage (protection requise)
router.delete('/code/:code', protect, deactivateShareCode);

module.exports = router;
