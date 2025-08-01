const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemStats,
  resetUserPassword
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et des privilèges admin
router.use(protect, requireAdmin);

// Routes pour la gestion des utilisateurs
router.route('/users')
  .get(getAllUsers)      // GET /api/admin/users - Obtenir tous les utilisateurs
  .post(createUser);     // POST /api/admin/users - Créer un utilisateur

router.route('/users/:id')
  .put(updateUser)       // PUT /api/admin/users/:id - Modifier un utilisateur
  .delete(deleteUser);   // DELETE /api/admin/users/:id - Supprimer un utilisateur

// Route pour réinitialiser un mot de passe
router.put('/users/:id/reset-password', resetUserPassword);

// Route pour les statistiques système
router.get('/stats', getSystemStats);

module.exports = router;
