const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * @desc    Enregistrer un nouvel utilisateur
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Vérifier si les champs requis sont fournis
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Veuillez remplir tous les champs');
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
    role: role || 'student', // Utiliser le rôle fourni ou 'student' par défaut
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // Inclure le rôle dans la réponse
      profileImage: user.profileImage,
      joinDate: user.joinDate,
      preferences: user.preferences,
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides');
  }
});

/**
 * @desc    Authentifier un utilisateur et obtenir un token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si les champs requis sont fournis
  if (!email || !password) {
    res.status(400);
    throw new Error('Veuillez fournir un email et un mot de passe');
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Email ou mot de passe invalide');
  }

  // Vérifier si le mot de passe correspond
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Email ou mot de passe invalide');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role, // Inclure le rôle dans la réponse
    profileImage: user.profileImage,
    joinDate: user.joinDate,
    preferences: user.preferences,
    token: user.getSignedJwtToken(),
  });
});

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // Inclure le rôle dans la réponse
      profileImage: user.profileImage,
      joinDate: user.joinDate,
      preferences: user.preferences,
    });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

/**
 * @desc    Mettre à jour le profil de l'utilisateur
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
      };
    }
    
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role, // Inclure le rôle dans la réponse
      profileImage: updatedUser.profileImage,
      joinDate: updatedUser.joinDate,
      preferences: updatedUser.preferences,
      token: updatedUser.getSignedJwtToken(),
    });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  // Ici, on supprime l'utilisateur actuel (pas d'admin pour le moment)
  const user = await User.findById(req.user._id);

  if (user) {
    await user.remove();
    res.json({ message: 'Utilisateur supprimé' });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};
