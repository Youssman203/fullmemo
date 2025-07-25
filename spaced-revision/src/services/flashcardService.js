import api from './api';

// Service pour gérer les flashcards
const flashcardService = {
  // Créer une nouvelle flashcard
  createFlashcard: async (flashcardData) => {
    return await api.post('/flashcards', flashcardData);
  },

  // Obtenir toutes les flashcards d'une collection
  getFlashcardsByCollection: async (collectionId) => {
    return await api.get(`/flashcards/collection/${collectionId}`);
  },

  // Obtenir une flashcard par son ID
  getFlashcardById: async (id) => {
    return await api.get(`/flashcards/${id}`);
  },

  // Mettre à jour une flashcard
  updateFlashcard: async (id, flashcardData) => {
    return await api.put(`/flashcards/${id}`, flashcardData);
  },

  // Supprimer une flashcard
  deleteFlashcard: async (id) => {
    return await api.delete(`/flashcards/${id}`);
  },

  // Récupérer les flashcards à réviser aujourd'hui
  getFlashcardsToReviewToday: async () => {
    return await api.get('/flashcards/review');
  },

  // Mettre à jour le statut de révision d'une flashcard
  updateFlashcardReview: async (id, reviewData) => {
    return await api.put(`/flashcards/${id}/review`, reviewData);
  },

  // Obtenir les statistiques d'une flashcard
  getFlashcardStats: async (id) => {
    return await api.get(`/flashcards/${id}/stats`);
  },

  // Récupérer toutes les flashcards de l'utilisateur
  getAllUserFlashcards: async () => {
    return await api.get('/flashcards');
  },

  // Récupérer les flashcards à revoir maintenant
  getFlashcardsDueNow: async () => {
    return await api.get('/flashcards/due-now');
  }
};

export default flashcardService;
