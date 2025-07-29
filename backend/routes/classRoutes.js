const express = require('express');
const router = express.Router();
const {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  getClassById,
  updateClass,
  deleteClass,
  inviteStudents,
  joinClassByCode,
  removeStudent,
  shareCollectionWithClass,
  unshareCollectionFromClass,
  getClassCollections
} = require('../controllers/classController');

const { protect, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

// Routes pour les étudiants (AVANT les routes enseignants pour éviter les conflits)
router.get('/student', protect, requireStudent, getStudentClasses);
router.post('/join/:inviteCode', protect, joinClassByCode);

// Routes pour les enseignants
router.route('/')
  .post(protect, requireTeacher, createClass)
  .get(protect, requireTeacher, getTeacherClasses);

router.route('/:id')
  .get(protect, requireTeacher, getClassById)
  .put(protect, requireTeacher, updateClass)
  .delete(protect, requireTeacher, deleteClass);

router.post('/:id/invite', protect, requireTeacher, inviteStudents);
router.delete('/:id/students/:studentId', protect, requireTeacher, removeStudent);

// Routes pour le partage de collections
router.post('/:id/collections', protect, requireTeacher, shareCollectionWithClass);
router.delete('/:id/collections/:collectionId', protect, requireTeacher, unshareCollectionFromClass);
router.get('/:id/collections', protect, getClassCollections);

module.exports = router;
