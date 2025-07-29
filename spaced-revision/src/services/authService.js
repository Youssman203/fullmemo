import api from './api';

// Service pour gérer l'authentification
const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      if (response && response.token) {
        // Sauvegarder le token et les infos utilisateur dans localStorage
        localStorage.setItem('token', response.token);
        // L'API renvoie les données utilisateur directement, pas dans response.user
        const userData = { ...response };
        delete userData.token; // Retirer le token des données utilisateur
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Connexion d'un utilisateur
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response && response.token) {
        // Sauvegarder le token et les infos utilisateur dans localStorage
        localStorage.setItem('token', response.token);
        // L'API renvoie les données utilisateur directement, pas dans response.user
        const userData = { ...response };
        delete userData.token; // Retirer le token des données utilisateur
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Récupération du profil utilisateur
  getUserProfile: async () => {
    try {
      return await api.get('/users/profile');
    } catch (error) {
      throw error;
    }
  },

  // Mise à jour du profil utilisateur
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      if (response && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Suppression du compte utilisateur
  deleteUserAccount: async () => {
    try {
      const response = await api.delete('/users/profile');
      // Supprimer les informations utilisateur du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    // Vérifier que les valeurs existent et ne sont pas "undefined" ou "null"
    return !!token && token !== 'undefined' && token !== 'null' &&
           !!user && user !== 'undefined' && user !== 'null';
  },

  // Récupérer l'utilisateur courant depuis le localStorage
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    // Vérifier si la valeur existe et n'est pas "undefined"
    if (user && user !== 'undefined' && user !== 'null') {
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        // Nettoyer le localStorage si les données sont corrompues
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  }
};

export default authService;
