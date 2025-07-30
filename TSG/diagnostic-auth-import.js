/**
 * 🔍 DIAGNOSTIC AUTORISATION IMPORT COLLECTIONS
 * 
 * Script pour diagnostiquer le problème "token non autorisé" lors de l'import
 */

console.log('🔍 DIAGNOSTIC AUTORISATION IMPORT - DÉBUT');

// 🔧 FONCTIONS DE DIAGNOSTIC
const diagnosticAuth = {
  
  // Vérifier l'état du token dans localStorage
  checkLocalStorage: () => {
    console.log('\n📱 VÉRIFICATION LOCALSTORAGE:');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔑 Token présent:', !!token);
    if (token) {
      console.log('🔑 Token (premiers 50 chars):', token.substring(0, 50) + '...');
      console.log('🔑 Token longueur:', token.length);
      
      // Décoder le JWT pour vérifier l'expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        
        console.log('📅 Token exp:', new Date(payload.exp * 1000));
        console.log('📅 Maintenant:', new Date(now * 1000));
        console.log('⏰ Token expiré:', isExpired);
        console.log('👤 User ID dans token:', payload.id);
        
        if (isExpired) {
          console.log('🚨 PROBLÈME: Token expiré !');
          return false;
        }
      } catch (e) {
        console.log('❌ Erreur décodage token:', e.message);
        return false;
      }
    } else {
      console.log('🚨 PROBLÈME: Pas de token !');
      return false;
    }
    
    console.log('👤 User présent:', !!user);
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('👤 User data:', {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        });
      } catch (e) {
        console.log('❌ Erreur parsing user data:', e.message);
      }
    } else {
      console.log('🚨 PROBLÈME: Pas de données utilisateur !');
      return false;
    }
    
    return true;
  },
  
  // Tester l'API avec le token actuel
  testApiAuth: async () => {
    console.log('\n🌐 TEST API AUTHENTIFICATION:');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Pas de token pour tester l\'API');
      return false;
    }
    
    // Test avec getUserProfile (endpoint qui nécessite auth)
    try {
      console.log('📡 Test avec /auth/profile...');
      
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Statut réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Auth réussie:', data.user?.name);
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ API Auth échoué:', response.status, errorText);
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erreur requête API:', error.message);
      return false;
    }
  },
  
  // Tester spécifiquement l'endpoint d'import
  testImportEndpoint: async (testCode = 'TEST99') => {
    console.log('\n📥 TEST ENDPOINT IMPORT:');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Pas de token pour tester l\'import');
      return false;
    }
    
    try {
      console.log('📡 Test import avec code:', testCode);
      
      const response = await fetch(`http://localhost:5000/api/share/code/${testCode}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Statut réponse import:', response.status);
      console.log('📡 Headers réponse:', [...response.headers.entries()]);
      
      const responseText = await response.text();
      console.log('📡 Réponse brute:', responseText);
      
      if (response.status === 401) {
        console.log('🚨 PROBLÈME CONFIRMÉ: 401 Unauthorized sur import');
        return false;
      } else if (response.status === 404) {
        console.log('✅ Auth OK (404 = code inexistant, normal pour test)');
        return true;
      } else {
        console.log('📊 Statut inattendu:', response.status);
        return response.ok;
      }
      
    } catch (error) {
      console.log('❌ Erreur test import:', error.message);
      return false;
    }
  },
  
  // Vérifier les headers envoyés
  checkRequestHeaders: () => {
    console.log('\n📋 VÉRIFICATION HEADERS:');
    
    const token = localStorage.getItem('token');
    if (token) {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('📋 Headers qui seraient envoyés:');
      Object.entries(headers).forEach(([key, value]) => {
        if (key === 'Authorization') {
          console.log(`   ${key}: Bearer ${value.substring(7, 27)}...`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
      
      return headers;
    } else {
      console.log('❌ Pas de token pour construire les headers');
      return null;
    }
  },
  
  // Test complet
  runFullDiagnostic: async () => {
    console.log('🔍 DIAGNOSTIC COMPLET - DÉBUT\n');
    
    const results = {
      localStorage: false,
      apiAuth: false,
      importEndpoint: false,
      headers: false
    };
    
    // 1. Vérifier localStorage
    results.localStorage = diagnosticAuth.checkLocalStorage();
    
    // 2. Vérifier headers
    results.headers = !!diagnosticAuth.checkRequestHeaders();
    
    // 3. Tester l'auth API générale
    if (results.localStorage) {
      results.apiAuth = await diagnosticAuth.testApiAuth();
    }
    
    // 4. Tester l'endpoint d'import spécifiquement
    if (results.localStorage) {
      results.importEndpoint = await diagnosticAuth.testImportEndpoint();
    }
    
    // Résumé
    console.log('\n📊 RÉSUMÉ DIAGNOSTIC:');
    console.log('   localStorage:', results.localStorage ? '✅' : '❌');
    console.log('   headers:', results.headers ? '✅' : '❌');
    console.log('   apiAuth:', results.apiAuth ? '✅' : '❌');
    console.log('   importEndpoint:', results.importEndpoint ? '✅' : '❌');
    
    // Diagnostic
    if (!results.localStorage) {
      console.log('\n🚨 PROBLÈME PRINCIPAL: Token manquant ou expiré');
      console.log('💡 SOLUTION: Se reconnecter');
    } else if (!results.apiAuth) {
      console.log('\n🚨 PROBLÈME PRINCIPAL: Token invalide côté serveur');
      console.log('💡 SOLUTION: Se reconnecter ou vérifier le backend');
    } else if (!results.importEndpoint) {
      console.log('\n🚨 PROBLÈME PRINCIPAL: Endpoint import spécifiquement bloqué');
      console.log('💡 SOLUTION: Vérifier les routes et middlewares backend');
    } else {
      console.log('\n✅ TOUT SEMBLE OK - Problème peut être dans le flux applicatif');
    }
    
    return results;
  }
};

// 🎯 SOLUTIONS AUTOMATISÉES
const solutionsAuth = {
  
  // Forcer reconnexion
  forceReconnect: () => {
    console.log('\n🔄 FORCE RECONNEXION:');
    
    // Nettoyer le storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    console.log('🧹 Storage nettoyé');
    console.log('↩️ Redirection vers login...');
    
    // Rediriger vers login
    window.location.href = '/login';
  },
  
  // Régénérer token
  regenerateToken: async () => {
    console.log('\n🔑 RÉGÉNÉRATION TOKEN:');
    
    const user = localStorage.getItem('user');
    if (!user) {
      console.log('❌ Pas de données utilisateur pour régénérer');
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      console.log('📡 Tentative régénération pour:', userData.email);
      
      // Ici, il faudrait appeler un endpoint de refresh token
      // ou redemander le mot de passe
      console.log('⚠️ Régénération automatique non implémentée');
      console.log('💡 Veuillez vous reconnecter manuellement');
      
      return false;
    } catch (e) {
      console.log('❌ Erreur parsing user data:', e.message);
      return false;
    }
  }
};

// 🚀 INTERFACE SIMPLE
window.diagAuth = diagnosticAuth;
window.fixAuth = solutionsAuth;

console.log(`
🔧 DIAGNOSTIC AUTORISATION IMPORT PRÊT

📋 COMMANDES DISPONIBLES:

// Diagnostic complet automatique
await diagAuth.runFullDiagnostic()

// Tests individuels
diagAuth.checkLocalStorage()
await diagAuth.testApiAuth()  
await diagAuth.testImportEndpoint('VOTRE_CODE')
diagAuth.checkRequestHeaders()

// Solutions
fixAuth.forceReconnect()          // Nettoie et redirige vers login
await fixAuth.regenerateToken()   // Tentative régénération (non impl.)

🎯 COMMENCEZ PAR:
await diagAuth.runFullDiagnostic()
`);

console.log('✅ Diagnostic chargé - Utilisez les commandes ci-dessus');
