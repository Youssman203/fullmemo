import api from './api';

// Service de gestion des collections
const collectionService = {
  // Récupérer toutes les collections de l'utilisateur
  // NOUVEAU: Support cache busting avec paramètre refresh
  getUserCollections: async (forceRefresh = false) => {
    const url = forceRefresh ? '/collections?refresh=true&t=' + Date.now() : '/collections';
    console.log('📡 API Call getUserCollections:', url);
    
    // Headers pour forcer le bypass cache navigateur
    const config = forceRefresh ? {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    } : {};
    
    return await api.get(url, config);
  },

  // Récupérer une collection par son ID
  getCollectionById: async (id) => {
    return await api.get(`/collections/${id}`);
  },

  // Créer une nouvelle collection
  createCollection: async (collectionData) => {
    console.log('Création d\'une nouvelle collection avec les données:', collectionData);
    try {
      const response = await api.post('/collections', collectionData);
      console.log('Réponse de création de collection:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la collection:', error);
      throw error;
    }
  },

  // Mettre à jour une collection existante
  updateCollection: async (id, collectionData) => {
    return await api.put(`/collections/${id}`, collectionData);
  },

  // Supprimer une collection
  deleteCollection: async (id) => {
    return await api.delete(`/collections/${id}`);
  },

  // Récupérer les collections publiques
  getPublicCollections: async () => {
    return await api.get('/collections/public');
  },

  // Récupérer les collections populaires
  getPopularCollections: async () => {
    return await api.get('/collections/popular');
  }
};

export default collectionService;
