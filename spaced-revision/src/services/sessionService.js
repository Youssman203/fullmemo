// src/services/sessionService.js
import api from './api';

const sessionService = {
  // Créer une nouvelle session (étudiant)
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/sessions', sessionData);
      console.log('📊 Session créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur création session:', error);
      throw error;
    }
  },

  // Obtenir la vue d'ensemble pour un enseignant
  getTeacherOverview: async () => {
    try {
      const response = await api.get('/sessions/teacher/overview');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération vue enseignant:', error);
      throw error;
    }
  },

  // Obtenir les sessions d'un étudiant spécifique (enseignant)
  getStudentSessions: async (studentId, options = {}) => {
    try {
      const { limit = 10, offset = 0, sessionType } = options;
      let url = `/sessions/student/${studentId}?limit=${limit}&offset=${offset}`;
      
      if (sessionType) {
        url += `&sessionType=${sessionType}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération sessions étudiant:', error);
      throw error;
    }
  },

  // Obtenir les détails d'une session
  getSessionDetails: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération détails session:', error);
      throw error;
    }
  },

  // Ajouter une note d'enseignant
  addTeacherNote: async (sessionId, note, rating = null) => {
    try {
      const response = await api.put(`/sessions/${sessionId}/note`, {
        note,
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Erreur ajout note enseignant:', error);
      throw error;
    }
  },

  // Obtenir les sessions récentes
  getRecentSessions: async (limit = 5) => {
    try {
      const response = await api.get(`/sessions/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération sessions récentes:', error);
      throw error;
    }
  },

  // Utilitaires pour formater les données
  formatSessionType: (type) => {
    const types = {
      'revision': 'Révision',
      'quiz': 'Quiz',
      'test': 'Test'
    };
    return types[type] || type;
  },

  formatDuration: (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  },

  getScoreColor: (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  },

  getScoreLabel: (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Très bien';
    if (percentage >= 70) return 'Bien';
    if (percentage >= 60) return 'Passable';
    return 'À améliorer';
  }
};

export default sessionService;
