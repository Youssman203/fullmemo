// backend/routes/evaluationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStudentsWithSharedCollections,
  getStudentSessions,
  getSessionDetails,
  evaluateSession,
  getEvaluationStats
} = require('../controllers/evaluationController');
const { protect, requireTeacher } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification enseignant
router.use(protect);
router.use(requireTeacher);

// Routes principales
router.get('/students', getStudentsWithSharedCollections);
router.get('/students/:studentId/sessions', getStudentSessions);
router.get('/sessions/:sessionId', getSessionDetails);
router.put('/sessions/:sessionId/evaluate', evaluateSession);
router.get('/stats', getEvaluationStats);

module.exports = router;
