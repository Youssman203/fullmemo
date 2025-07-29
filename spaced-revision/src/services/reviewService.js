import api from './api';

// Service pour gérer les sessions de révision
const reviewService = {
  // Créer une nouvelle session de révision
  startReviewSession: async (sessionData) => {
    return await api.post('/reviews', sessionData);
  },

  // Mettre à jour une session de révision existante
  updateReviewSession: async (id, sessionData) => {
    return await api.put(`/reviews/${id}`, sessionData);
  },

  // Obtenir une session de révision par son ID
  getReviewSessionById: async (id) => {
    return await api.get(`/reviews/${id}`);
  },

  // Obtenir toutes les sessions de révision de l'utilisateur
  getUserReviewSessions: async () => {
    return await api.get('/reviews');
  },

  // Obtenir des statistiques sur les révisions de l'utilisateur
  getUserReviewStats: async () => {
    return await api.get('/reviews/stats');
  },

  // Obtenir l'historique des révisions de l'utilisateur
  getReviewHistory: async () => {
    // Utiliser la route existante qui retourne les sessions de l'utilisateur
    return await api.get('/reviews');
  },

  // Obtenir le temps d'étude d'aujourd'hui
  getTodayStudyTime: async () => {
    return await api.get('/reviews/today-time');
  }
};

export default reviewService;
