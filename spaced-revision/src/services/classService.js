// src/services/classService.js
import api from './api';

const classService = {
  // Créer une nouvelle classe
  createClass: async (classData) => {
    try {
      console.log('Tentative de création de classe avec les données:', classData);
      const response = await api.post('/classes', classData);
      console.log('Réponse de création de classe:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  },

  // Obtenir toutes les classes d'un enseignant
  getTeacherClasses: async () => {
    try {
      console.log('Tentative de récupération des classes...');
      const response = await api.get('/classes');
      console.log('Réponse de récupération des classes:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  // Obtenir toutes les classes d'un étudiant
  getStudentClasses: async () => {
    try {
      console.log('Tentative de récupération des classes de l\'étudiant...');
      const response = await api.get('/classes/student');
      console.log('Réponse de récupération des classes de l\'étudiant:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des classes de l\'étudiant:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  // Obtenir une classe par ID
  getClassById: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la classe:', error);
      throw error;
    }
  },

  // Mettre à jour une classe
  updateClass: async (classId, classData) => {
    try {
      const response = await api.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe:', error);
      throw error;
    }
  },

  // Supprimer une classe
  deleteClass: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      throw error;
    }
  },

  // Inviter des étudiants par email
  inviteStudents: async (classId, emails) => {
    try {
      const response = await api.post(`/classes/${classId}/invite`, { emails });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'invitation des étudiants:', error);
      throw error;
    }
  },

  // Rejoindre une classe avec un code d'invitation
  joinClassByCode: async (inviteCode) => {
    try {
      console.log('Tentative d\'adhésion avec le code:', inviteCode);
      const response = await api.post(`/classes/join/${inviteCode}`);
      console.log('Réponse d\'adhésion:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'adhésion à la classe:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  },

  // Retirer un étudiant d'une classe
  removeStudent: async (classId, studentId) => {
    try {
      const response = await api.delete(`/classes/${classId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du retrait de l\'étudiant:', error);
      throw error;
    }
  },

  // Obtenir les statistiques d'une classe
  getClassStats: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Obtenir les détails complets d'une classe
  getClassById: async (classId) => {
    try {
      console.log('Calling API for class ID:', classId);
      const response = await api.get(`/classes/${classId}`);
      console.log('API response for getClassById:', response);
      
      // L'API retourne directement les données, pas dans response.data
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la classe:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      throw error;
    }
  },

  // Partager une collection avec une classe
  shareCollectionWithClass: async (classId, collectionId) => {
    try {
      const response = await api.post(`/classes/${classId}/collections`, {
        collectionId
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du partage de la collection:', error);
      throw error;
    }
  },

  // Retirer le partage d'une collection d'une classe
  unshareCollectionFromClass: async (classId, collectionId) => {
    try {
      const response = await api.delete(`/classes/${classId}/collections/${collectionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du retrait de la collection:', error);
      throw error;
    }
  },

  // Obtenir les collections partagées d'une classe
  getClassCollections: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/collections`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des collections:', error);
      throw error;
    }
  },

  // Importer une collection partagée dans les collections personnelles de l'étudiant
  importCollectionFromClass: async (classId, collectionId) => {
    try {
      const response = await api.post(`/classes/${classId}/collections/import`, {
        collectionId
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'importation de la collection:', error);
      throw error;
    }
  }
};

export default classService;
