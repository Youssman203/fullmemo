// Configuration de base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fonction pour obtenir le token JWT du localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Service API utilisant Fetch au lieu d'axios
const api = {
  // Méthode GET
  async get(endpoint) {
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
        method: 'GET',
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
