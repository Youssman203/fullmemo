const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT pour l'authentification
 * @param {string} id - ID utilisateur à encoder dans le token
 * @returns {string} Token JWT signé
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = generateToken;
