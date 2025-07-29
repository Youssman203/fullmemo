import api from './api';

// Service pour gérer les liens partagés
const sharedLinkService = {
  // Créer un lien partagé pour une collection
  createSharedLink: async (collectionId, config = {}) => {
    try {
      const response = await api.post(`/shared/collections/${collectionId}`, config);
      return response;
    } catch (error) {
      console.error('Erreur createSharedLink:', error);
      throw error;
    }
  },

  // Récupérer tous les liens partagés de l'utilisateur connecté
  getUserSharedLinks: async () => {
    try {
      const response = await api.get('/shared/manage');
      return response;
    } catch (error) {
      console.error('Erreur getUserSharedLinks:', error);
      throw error;
    }
  },

  // Désactiver un lien partagé
  deactivateSharedLink: async (linkId) => {
    try {
      const response = await api.delete(`/shared/manage/${linkId}`);
      return response;
    } catch (error) {
      console.error('Erreur deactivateSharedLink:', error);
      throw error;
    }
  },

  // Accès public aux collections partagées (sans utiliser api.js car pas d'auth)
  getSharedCollection: async (token, password = null) => {
    try {
      console.log('🔗 sharedLinkService.getSharedCollection appelé');
      console.log('   Token:', token);
      console.log('   Password:', password ? '[FOURNI]' : '[AUCUN]');
      
      const API_BASE = 'http://localhost:5000/api';
      let url = `${API_BASE}/shared/${token}`;
      
      if (password) {
        url += `?password=${encodeURIComponent(password)}`;
      }
      
      console.log('   URL complète:', url);

      const authToken = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('   Token auth ajouté:', authToken.substring(0, 20) + '...');
      } else {
        console.log('   Aucun token auth');
      }
      
      console.log('   Headers:', headers);
      console.log('📡 Fetch en cours...');

      const response = await fetch(url, { method: 'GET', headers });
      
      console.log('📨 Response reçue:');
      console.log('   Status:', response.status);
      console.log('   OK:', response.ok);
      console.log('   Headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('   Data parsed:', data);

      if (!response.ok) {
        console.log('❌ Response not OK');
        if (response.status === 401 && data.requiresPassword) {
          console.log('🔐 Mot de passe requis');
          throw { requiresPassword: true, message: data.message };
        }
        const errorMsg = data.message || 'Erreur lors de l\'accès à la collection';
        console.log('❌ Throwing error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ Response OK, returning data');
      return data;
    } catch (error) {
      console.error('❌ sharedLinkService error:', error);
      console.error('   Type:', typeof error);
      console.error('   Keys:', Object.keys(error));
      throw error;
    }
  },

  // Télécharger/Copier une collection via un lien partagé
  downloadSharedCollection: async (token, password = null) => {
    try {
      const API_BASE = 'http://localhost:5000/api';
      const authToken = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const body = password ? { password } : {};

      const response = await fetch(`${API_BASE}/shared/${token}/download`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du téléchargement');
      }

      return data;
    } catch (error) {
      console.error('Erreur downloadSharedCollection:', error);
      throw error;
    }
  },

  // Générer un fichier de téléchargement pour une collection
  downloadAsFile: (collection, flashcards, format = 'json') => {
    const data = {
      collection: {
        name: collection.name,
        description: collection.description,
        category: collection.category,
        difficulty: collection.difficulty,
        tags: collection.tags
      },
      flashcards: flashcards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        category: card.category,
        tags: card.tags
      })),
      exportedAt: new Date().toISOString(),
      format: format
    };

    let content, filename, mimeType;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `${collection.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        const csvHeaders = 'Question,Answer,Difficulty,Category,Tags\n';
        const csvContent = flashcards.map(card => 
          `"${card.question}","${card.answer}","${card.difficulty}","${card.category}","${(card.tags || []).join(';')}"`
        ).join('\n');
        content = csvHeaders + csvContent;
        filename = `${collection.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
        mimeType = 'text/csv';
        break;
      
      default:
        throw new Error('Format non supporté');
    }

    // Créer et déclencher le téléchargement
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { filename, size: blob.size };
  }
};

export default sharedLinkService;
