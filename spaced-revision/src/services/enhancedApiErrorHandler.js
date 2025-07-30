/**
 * 🛠️ GESTIONNAIRE D'ERREURS API AMÉLIORÉ
 * 
 * Gestion spécialisée des erreurs d'authentification
 */

// Fonction pour analyser et gérer les erreurs 401 en détail
export const handleAuthenticationError = async (response, endpoint) => {
  console.error('🚨 ERREUR AUTHENTIFICATION DÉTECTÉE');
  console.log('📍 Endpoint:', endpoint);
  console.log('📊 Status:', response.status);
  console.log('🌐 URL complète:', response.url);
  
  // Analyser les headers de réponse
  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
  console.log('📋 Headers réponse:', responseHeaders);
  
  // Tenter de lire le body d'erreur
  let errorDetails = null;
  try {
    const errorText = await response.text();
    console.log('📝 Body erreur brut:', errorText);
    
    try {
      errorDetails = JSON.parse(errorText);
      console.log('📄 Erreur parsée:', errorDetails);
    } catch (e) {
      console.log('📄 Erreur non-JSON:', errorText);
    }
  } catch (e) {
    console.log('❌ Impossible de lire le body d\'erreur');
  }
  
  // Analyser le token local
  const token = localStorage.getItem('token');
  console.log('🔑 Token présent:', !!token);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      
      console.log('🔍 Analyse token:');
      console.log('   - User ID:', payload.id);
      console.log('   - Émis le:', new Date(payload.iat * 1000));
      console.log('   - Expire le:', new Date(payload.exp * 1000));
      console.log('   - Maintenant:', new Date(now * 1000));
      console.log('   - Expiré:', isExpired);
      console.log('   - Temps restant:', payload.exp - now, 'secondes');
      
      if (isExpired) {
        console.log('🚨 CAUSE: Token expiré depuis', now - payload.exp, 'secondes');
        return 'TOKEN_EXPIRED';
      } else {
        console.log('🚨 CAUSE: Token valide mais rejeté par le serveur');
        return 'TOKEN_REJECTED';
      }
    } catch (e) {
      console.log('🚨 CAUSE: Token corrompu/invalide');
      console.error('Erreur décodage:', e.message);
      return 'TOKEN_INVALID';
    }
  } else {
    console.log('🚨 CAUSE: Aucun token présent');
    return 'TOKEN_MISSING';
  }
};

// Fonction pour nettoyer et rediriger selon le type d'erreur
export const handleAuthenticationFailure = (errorType, endpoint) => {
  console.log('🧹 NETTOYAGE ET REDIRECTION:', errorType);
  
  // Nettoyer complètement le storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  // Messages spécifiques selon le type d'erreur
  const messages = {
    TOKEN_EXPIRED: 'Votre session a expiré. Reconnexion nécessaire.',
    TOKEN_REJECTED: 'Votre session est invalide. Reconnexion nécessaire.',
    TOKEN_INVALID: 'Données de session corrompues. Reconnexion nécessaire.',
    TOKEN_MISSING: 'Aucune session active. Connexion requise.'
  };
  
  const message = messages[errorType] || 'Problème d\'authentification. Reconnexion requise.';
  
  // Construire l'URL de redirection avec informations
  const redirectUrl = `/login?error=auth_failed&type=${errorType}&from=${encodeURIComponent(endpoint)}&message=${encodeURIComponent(message)}`;
  
  console.log('↩️ Redirection vers:', redirectUrl);
  
  // Redirection immédiate
  window.location.href = redirectUrl;
  
  // Retourner l'erreur pour le catch
  throw new Error(message);
};

// Fonction principale pour gérer les erreurs 401/403
export const handleApiAuthError = async (response, endpoint) => {
  console.log('🔧 GESTIONNAIRE ERREUR AUTH ACTIVÉ');
  
  const errorType = await handleAuthenticationError(response, endpoint);
  return handleAuthenticationFailure(errorType, endpoint);
};

// Fonction pour vérifier l'auth avant un appel critique
export const validateAuthBeforeRequest = () => {
  console.log('🔒 VALIDATION AUTH PRÉVENTIVE');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Pas de token - Auth manquante');
    handleAuthenticationFailure('TOKEN_MISSING', 'pre-request-check');
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    
    if (timeUntilExpiry <= 0) {
      console.error('❌ Token expiré - Auth invalide');
      handleAuthenticationFailure('TOKEN_EXPIRED', 'pre-request-check');
      return false;
    }
    
    if (timeUntilExpiry < 60) { // Moins d'1 minute
      console.warn('⚠️ Token expire très bientôt');
      // Ne pas bloquer mais avertir
    }
    
    console.log('✅ Auth valide -', timeUntilExpiry, 'secondes restantes');
    return true;
    
  } catch (error) {
    console.error('❌ Token invalide - Auth corrompue');
    handleAuthenticationFailure('TOKEN_INVALID', 'pre-request-check');
    return false;
  }
};

export default {
  handleApiAuthError,
  validateAuthBeforeRequest,
  handleAuthenticationError,
  handleAuthenticationFailure
};
