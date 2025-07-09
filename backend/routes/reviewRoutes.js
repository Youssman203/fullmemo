const express = require('express');
const router = express.Router();
const {
  startReviewSession,
  updateReviewSession,
  getReviewSessionById,
  getUserReviewSessions,
  getReviewStats
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les sessions de révision
router.route('/')
  .post(startReviewSession)
  .get(getUserReviewSessions);

router.route('/stats')
  .get(getReviewStats);

router.route('/:id')
  .get(getReviewSessionById)
  .put(updateReviewSession);

module.exports = router;
