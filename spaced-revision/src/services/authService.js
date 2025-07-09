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
        localStorage.setItem('user', JSON.stringify(response.user));
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
        localStorage.setItem('user', JSON.stringify(response.user));
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
    return !!token && !!user;
  },

  // Récupérer l'utilisateur courant depuis le localStorage
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
