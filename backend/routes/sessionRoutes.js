// backend/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSession,
  getStudentSessions,
  getTeacherOverview,
  getSessionDetails,
  addTeacherNote,
  getRecentSessions
} = require('../controllers/sessionController');
const { protect, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

// Routes publiques (nécessitent juste une authentification)
router.get('/recent', protect, getRecentSessions);
router.get('/:sessionId', protect, getSessionDetails);

// Routes pour les apprenants
router.post('/', protect, requireStudent, createSession);

// Routes pour les enseignants
router.get('/teacher/overview', protect, requireTeacher, getTeacherOverview);
router.get('/student/:studentId', protect, requireTeacher, getStudentSessions);
router.put('/:sessionId/note', protect, requireTeacher, addTeacherNote);

module.exports = router;
