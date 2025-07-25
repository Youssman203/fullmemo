const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * Middleware de protection des routes
 * Vérifie si l'utilisateur est authentifié via le token JWT
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Vérifier si le token existe dans les headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Non autorisé, token invalide');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Non autorisé, pas de token');
  }
});

/**
 * Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
 */
const checkOwnership = (model) => asyncHandler(async (req, res, next) => {
  const resourceId = req.params.id;
  const resource = await model.findById(resourceId);

  if (!resource) {
    res.status(404);
    throw new Error('Ressource non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (resource.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette ressource');
  }

  // Si tout est bon, on continue
  req.resource = resource;
  next();
});

module.exports = { protect, checkOwnership };
