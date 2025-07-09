/**
 * Middleware pour gérer les erreurs 404 (ressource non trouvée)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware de gestion des erreurs
 * Formate les réponses d'erreur de manière cohérente
 */
const errorHandler = (err, req, res, next) => {
  // Si le code de statut est 200 mais qu'on a une erreur, on le change en 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
