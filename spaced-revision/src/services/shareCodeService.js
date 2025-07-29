import api from './api';

// Service pour gérer les codes de partage courts
const shareCodeService = {
  // Générer un code de partage pour une collection
  generateShareCode: async (collectionId) => {
    try {
      console.log('🔢 Génération code de partage pour collection:', collectionId);
      const response = await api.post(`/share/collections/${collectionId}/generate`);
      console.log('✅ Code généré:', response.data.code);
      return response;
    } catch (error) {
      console.error('❌ Erreur génération code:', error);
      throw error;
    }
  },

  // Accéder à une collection via un code
  getCollectionByCode: async (code) => {
    try {
      console.log('🔍 Recherche collection avec code:', code);
      const response = await api.get(`/share/code/${code.toUpperCase()}`);
      console.log('✅ Collection trouvée:', response.data.collection?.name);
      return response;
    } catch (error) {
      console.error('❌ Erreur recherche par code:', error);
      throw error;
    }
  },

  // Importer une collection via un code
  importCollectionByCode: async (code) => {
    try {
      console.log('📥 Import collection avec code:', code);
      const response = await api.post(`/share/code/${code.toUpperCase()}/import`);
      console.log('✅ Collection importée:', response.data.collection?.name);
      return response;
    } catch (error) {
      console.error('❌ Erreur import par code:', error);
      throw error;
    }
  },

  // Récupérer tous les codes de partage de l'utilisateur
  getUserShareCodes: async () => {
    try {
      console.log('📋 Récupération codes utilisateur');
      const response = await api.get('/share/manage');
      console.log('✅ Codes récupérés:', response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ Erreur récupération codes:', error);
      throw error;
    }
  },

  // Désactiver un code de partage
  deactivateShareCode: async (code) => {
    try {
      console.log('🚫 Désactivation code:', code);
      const response = await api.delete(`/share/code/${code.toUpperCase()}`);
      console.log('✅ Code désactivé');
      return response;
    } catch (error) {
      console.error('❌ Erreur désactivation code:', error);
      throw error;
    }
  },

  // Valider le format d'un code (6 caractères alphanumériques)
  validateCodeFormat: (code) => {
    if (!code) return false;
    const cleanCode = code.toString().toUpperCase().trim();
    return /^[A-Z0-9]{6}$/.test(cleanCode);
  },

  // Nettoyer et formater un code
  formatCode: (code) => {
    if (!code) return '';
    return code.toString().toUpperCase().trim();
  }
};

export default shareCodeService;
