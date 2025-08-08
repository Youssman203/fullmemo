// Configuration de base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Fonction pour obtenir le token JWT du localStorage avec validation
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ [API] Pas de token d\'authentification');
    return null;
  }
  
  // Vérifier si le token est expiré
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) {
      console.warn('⚠️ [API] Token expiré, nettoyage automatique');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('❌ [API] Token invalide, nettoyage:', error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

// Fonction pour gérer les erreurs d'authentification
const handleAuthError = (endpoint, status) => {
  console.error('❌ [API] Erreur d\'authentification:', status);
  console.log('🔍 [API] Endpoint concerné:', endpoint);
  
  const token = localStorage.getItem('token');
  console.log('🔍 [API] Token présent avant erreur:', !!token);
  
  if (token) {
    console.log('🔍 [API] Token (20 premiers chars):', token.substring(0, 20));
    
    // Vérifier si le token est expiré
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      console.log('🔍 [API] Token expiré:', isExpired);
      if (isExpired) {
        console.log('🔍 [API] Expiration:', new Date(payload.exp * 1000));
      }
    } catch (e) {
      console.log('🔍 [API] Erreur décodage token:', e.message);
    }
  }
  
  // Nettoyer complètement le storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  console.log('↩️ [API] Redirection vers login dans 1 seconde...');
  
  // Délai pour permettre de voir les logs
  setTimeout(() => {
    window.location.href = '/login?error=session_expired&from=' + encodeURIComponent(endpoint);
  }, 1000);
  
  throw new Error(`Session expirée lors de l'accès à ${endpoint} - Reconnexion requise`);
};

// Service API utilisant Fetch au lieu d'axios
const api = {
  // Méthode GET
  async get(endpoint) {
    // Logs spéciaux pour les collections de classe
    const isClassCollections = endpoint.includes('/collections');
    if (isClassCollections) {
      console.log('🔍 [API] Requête collections classe:', endpoint);
    }
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token si disponible
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      if (isClassCollections) {
        console.log('🔍 [API] Token présent:', token.substring(0, 20) + '...');
      }
    } else if (isClassCollections) {
      console.log('⚠️ [API] Pas de token d\'authentification');
    }
    
    if (isClassCollections) {
      console.log('🔍 [API] URL complète:', `${API_URL}${endpoint}`);
      console.log('🔍 [API] Headers:', headers);
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers
      });
      
      if (isClassCollections) {
        console.log('🔍 [API] Statut réponse:', response.status);
        console.log('🔍 [API] Headers réponse:', [...response.headers.entries()]);
      }
      
      // Gestion des erreurs
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Erreur HTTP ${response.status}`;
          throw new Error(errorMessage);
        } catch (e) {
          if (e instanceof SyntaxError) {
            // Si la réponse n'est pas du JSON valide
            throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
          }
          throw e; // Rethrow l'erreur déjà formatée
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // S'assurer que l'erreur est toujours une instance d'Error
      if (!(error instanceof Error)) {
        const errorMessage = error && typeof error === 'object' ? JSON.stringify(error) : String(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
  
  // Méthode POST
  async post(endpoint, data) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token si disponible
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      
      // Gestion des erreurs
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Erreur HTTP ${response.status}`;
          throw new Error(errorMessage);
        } catch (e) {
          if (e instanceof SyntaxError) {
            // Si la réponse n'est pas du JSON valide
            throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
          }
          throw e; // Rethrow l'erreur déjà formatée
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // S'assurer que l'erreur est toujours une instance d'Error
      if (!(error instanceof Error)) {
        const errorMessage = error && typeof error === 'object' ? JSON.stringify(error) : String(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
  
  // Méthode PUT
  async put(endpoint, data) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token si disponible
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      
      // Gestion des erreurs
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Erreur HTTP ${response.status}`;
          throw new Error(errorMessage);
        } catch (e) {
          if (e instanceof SyntaxError) {
            // Si la réponse n'est pas du JSON valide
            throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
          }
          throw e; // Rethrow l'erreur déjà formatée
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // S'assurer que l'erreur est toujours une instance d'Error
      if (!(error instanceof Error)) {
        const errorMessage = error && typeof error === 'object' ? JSON.stringify(error) : String(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
  
  // Méthode DELETE
  async delete(endpoint) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token si disponible
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers
      });
      
      // Gestion des erreurs
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Erreur HTTP ${response.status}`;
          throw new Error(errorMessage);
        } catch (e) {
          if (e instanceof SyntaxError) {
            // Si la réponse n'est pas du JSON valide
            throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
          }
          throw e; // Rethrow l'erreur déjà formatée
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // S'assurer que l'erreur est toujours une instance d'Error
      if (!(error instanceof Error)) {
        const errorMessage = error && typeof error === 'object' ? JSON.stringify(error) : String(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
};

export default api;
