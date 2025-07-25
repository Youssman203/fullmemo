const express = require('express');
const router = express.Router();
const {
  createFlashcard,
  getFlashcardsByCollection,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardsToReviewToday,
  updateFlashcardReview,
  getFlashcardStats,
  getAllUserFlashcards,
  getFlashcardsDueNow
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les flashcards
router.route('/')
  .post(createFlashcard)
  .get(getAllUserFlashcards);

router.route('/collection/:collectionId')
  .get(getFlashcardsByCollection);

router.route('/review/today')
  .get(getFlashcardsToReviewToday);

router.route('/due-now')
  .get(getFlashcardsDueNow);

router.route('/stats')
  .get(getFlashcardStats);

router.route('/:id')
  .get(getFlashcardById)
  .put(updateFlashcard)
  .delete(deleteFlashcard);

router.route('/:id/review')
  .put(updateFlashcardReview);

module.exports = router;
