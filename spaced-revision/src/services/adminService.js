// Service pour les opérations d'administration
import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const adminService = {
  // Récupérer la liste des utilisateurs avec pagination et filtres
  async getAllUsers(params = {}) {
    const { page = 1, limit = 10, search = '', role = '' } = params;
    
    try {
      const response = await api.get(
        `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}`
      );
      
      console.log(' [AdminService] Utilisateurs récupérés:', response);
      return response;
    } catch (error) {
      console.error(' [AdminService] Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      
      console.log(' [AdminService] Utilisateur créé:', response.user?.name);
      return response;
    } catch (error) {
      console.error(' [AdminService] Erreur lors de la création:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      
      console.log(' [AdminService] Utilisateur mis à jour:', response.user?.name);
      return response;
    } catch (error) {
      console.error(' [AdminService] Erreur lors de la mise à jour:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const response = await api.delete(`${API_URL}/admin/users/${userId}`);
      
      console.log(' [AdminService] Utilisateur supprimé');
      return response;
    } catch (error) {
      console.error(' [AdminService] Erreur lors de la suppression:', error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe d'un utilisateur
  async resetUserPassword(userId, newPassword) {
    try {
      const response = await api.put(
        `${API_URL}/admin/users/${userId}/reset-password`,
        { password: newPassword }
      );
      
      console.log(' [AdminService] Mot de passe réinitialisé');
      return response;
    } catch (error) {
      console.error(' [AdminService] Erreur lors de la réinitialisation:', error);
      throw error;
    }
  },

  // Récupérer les statistiques système
  async getSystemStats() {
    try {
      const response = await api.get(`${API_URL}/admin/stats`);
      
      console.log(' [AdminService] Statistiques récupérées:', response);
      return response;
    } catch (error) {
      console.error(' [AdminService] Erreur lors de la récupération des stats:', error);
      throw error;
    }
  }
};

export default adminService;
