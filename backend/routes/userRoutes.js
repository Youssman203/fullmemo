const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/', registerUser);
router.post('/login', loginUser);

// Routes protégées (nécessitent authentification)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/')
  .delete(protect, deleteUser);

module.exports = router;
