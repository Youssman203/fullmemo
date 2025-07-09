const express = require('express');
const router = express.Router();
const {
  createCollection,
  getUserCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getPublicCollections,
  getPopularCollections
} = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/public', getPublicCollections);
router.get('/popular', getPopularCollections);

// Routes protégées (nécessitent authentification)
router.route('/')
  .post(protect, createCollection)
  .get(protect, getUserCollections);

router.route('/:id')
  .get(protect, getCollectionById)
  .put(protect, updateCollection)
  .delete(protect, deleteCollection);

module.exports = router;
