const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Flashcard = require('../models/flashcardModel');
const Class = require('../models/classModel');

/**
 * @desc    Obtenir tous les utilisateurs (admin seulement)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  
  // Construction du filtre de recherche
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role && role !== 'all') {
    filter.role = role;
  }

  const skip = (page - 1) * limit;
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalUsers = await User.countDocuments(filter);
  
  // Obtenir les statistiques pour chaque utilisateur
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const userObj = user.toObject();
      
      if (user.role === 'teacher') {
        const collectionsCount = await Collection.countDocuments({ user: user._id });
        const classesCount = await Class.countDocuments({ teacher: user._id });
        userObj.stats = { collections: collectionsCount, classes: classesCount };
      } else if (user.role === 'student') {
        const collectionsCount = await Collection.countDocuments({ user: user._id });
        const classesCount = await Class.countDocuments({ students: user._id });
        userObj.stats = { collections: collectionsCount, classes: classesCount };
      }
      
      return userObj;
    })
  );

  res.json({
    success: true,
    data: {
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * @desc    Créer un nouvel utilisateur (admin seulement)
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation des données
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Tous les champs sont obligatoires');
  }

  if (!['student', 'teacher'].includes(role)) {
    res.status(400);
    throw new Error('Le rôle doit être "student" ou "teacher"');
  }

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  // Créer l'utilisateur
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: user.joinDate,
        createdAt: user.createdAt
      },
      message: `${role === 'teacher' ? 'Enseignant' : 'Étudiant'} créé avec succès`
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides');
  }
});

/**
 * @desc    Mettre à jour un utilisateur (admin seulement)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  // Vérifier que l'utilisateur existe
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Empêcher l'admin de modifier son propre rôle
  if (userId === req.user._id.toString() && role !== 'admin') {
    res.status(403);
    throw new Error('Impossible de modifier votre propre rôle d\'administrateur');
  }

  // Vérifier l'unicité de l'email si modifié
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Un utilisateur avec cet email existe déjà');
    }
  }

  // Mettre à jour les champs
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role && ['student', 'teacher', 'admin'].includes(role)) {
    updateData.role = role;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.json({
    success: true,
    data: updatedUser,
    message: 'Utilisateur mis à jour avec succès'
  });
});

/**
 * @desc    Supprimer un utilisateur (admin seulement)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Vérifier que l'utilisateur existe
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Empêcher l'admin de se supprimer lui-même
  if (userId === req.user._id.toString()) {
    res.status(403);
    throw new Error('Impossible de supprimer votre propre compte');
  }

  // Supprimer les données associées à l'utilisateur
  if (user.role === 'teacher') {
    // Supprimer les collections de l'enseignant
    await Collection.deleteMany({ user: userId });
    // Supprimer les cartes des collections de l'enseignant
    await Flashcard.deleteMany({ user: userId });
    // Supprimer les classes créées par l'enseignant
    await Class.deleteMany({ teacher: userId });
  } else if (user.role === 'student') {
    // Supprimer les collections de l'étudiant
    await Collection.deleteMany({ user: userId });
    // Supprimer les cartes des collections de l'étudiant
    await Flashcard.deleteMany({ user: userId });
    // Retirer l'étudiant de toutes ses classes
    await Class.updateMany(
      { students: userId },
      { $pull: { students: userId } }
    );
  }

  // Supprimer l'utilisateur
  await User.findByIdAndDelete(userId);

  res.json({
    success: true,
    message: `${user.role === 'teacher' ? 'Enseignant' : 'Étudiant'} et toutes ses données supprimés avec succès`
  });
});

/**
 * @desc    Obtenir les statistiques du système (admin seulement)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getSystemStats = asyncHandler(async (req, res) => {
  // Compter les utilisateurs par rôle
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });

  // Compter les ressources
  const totalCollections = await Collection.countDocuments();
  const totalFlashcards = await Flashcard.countDocuments();
  const totalClasses = await Class.countDocuments();

  // Utilisateurs récents (7 derniers jours)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  // Collections récentes (7 derniers jours)
  const recentCollections = await Collection.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  res.json({
    success: true,
    data: {
      users: {
        total: totalStudents + totalTeachers + totalAdmins,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
        recent: recentUsers
      },
      resources: {
        collections: totalCollections,
        flashcards: totalFlashcards,
        classes: totalClasses,
        recentCollections
      }
    }
  });
});

/**
 * @desc    Réinitialiser le mot de passe d'un utilisateur (admin seulement)
 * @route   PUT /api/admin/users/:id/reset-password
 * @access  Private/Admin
 */
const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.params.id;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }

  // Vérifier que l'utilisateur existe
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Mettre à jour le mot de passe
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès'
  });
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemStats,
  resetUserPassword
};
