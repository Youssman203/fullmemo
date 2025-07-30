/**
 * 🔍 DIAGNOSTIC FRONTEND - PROBLÈME TOKEN NON AUTORISÉ
 * À exécuter dans la console du navigateur
 */

// 🎯 DIAGNOSTIC COMPLET FRONTEND
window.diagFrontend = {
  
  // 1. Vérifier état authentification
  checkAuthState() {
    console.log('🔍 1. ÉTAT AUTHENTIFICATION FRONTEND');
    console.log('=====================================');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token présent:', !!token);
    console.log('User présent:', !!user);
    
    if (token) {
      console.log('Token (premiers 50 car):', token.substring(0, 50) + '...');
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📊 Payload token:');
        console.log('   User ID:', payload.id);
        console.log('   Émis le:', new Date(payload.iat * 1000));
        console.log('   Expire le:', new Date(payload.exp * 1000));
        console.log('   Maintenant:', new Date());
        console.log('   Expiré:', payload.exp < Math.floor(Date.now() / 1000));
        console.log('   Temps restant (min):', Math.floor((payload.exp - Math.floor(Date.now() / 1000)) / 60));
      } catch (e) {
        console.log('❌ Erreur décodage token:', e.message);
      }
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('👤 Données utilisateur:');
        console.log('   Nom:', userData.name);
        console.log('   Email:', userData.email);
        console.log('   Rôle:', userData.role);
        console.log('   ID:', userData._id);
      } catch (e) {
        console.log('❌ Erreur parsing user:', e.message);
      }
    }
  },
  
  // 2. Tester requête API directe
  async testApiDirect() {
    console.log('\n🔍 2. TEST API DIRECT FRONTEND');
    console.log('==============================');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Pas de token, impossible de tester');
      return;
    }
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    console.log('URL API:', API_URL);
    
    try {
      console.log('Test route profile...');
      const profileResponse = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile status:', profileResponse.status);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile récupéré:', profileData.name);
      } else {
        const errorData = await profileResponse.text();
        console.log('❌ Erreur profile:', errorData);
      }
      
    } catch (error) {
      console.log('❌ Erreur requête:', error.message);
    }
  },
  
  // 3. Tester import avec code réel
  async testImportWithCode(shareCode) {
    console.log('\n🔍 3. TEST IMPORT AVEC CODE');
    console.log('===========================');
    console.log('Code à tester:', shareCode);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Pas de token, connexion requise');
      return;
    }
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    try {
      console.log('🚀 Tentative import...');
      console.log('URL:', `${API_URL}/share/code/${shareCode}/import`);
      console.log('Token (30 car):', token.substring(0, 30) + '...');
      
      const response = await fetch(`${API_URL}/share/code/${shareCode}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🎯 RÉSULTAT IMPORT FRONTEND:');
      console.log('Status:', response.status);
      console.log('Headers:', [...response.headers.entries()]);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ IMPORT RÉUSSI Frontend!');
        console.log('Données:', data);
      } else {
        const errorData = await response.text();
        console.log('❌ ERREUR IMPORT Frontend:');
        console.log('Réponse:', errorData);
        
        if (response.status === 401) {
          console.log('🚨 ERREUR 401 - TOKEN REJETÉ PAR BACKEND');
          console.log('💡 Possible causes:');
          console.log('   - Token frontend différent du token backend');
          console.log('   - Headers malformés');
          console.log('   - CORS issues');
          console.log('   - URL incorrecte');
        }
      }
      
    } catch (error) {
      console.log('❌ Erreur fetch:', error.message);
    }
  },
  
  // 4. Comparer avec service shareCodeService
  async testShareCodeService(shareCode) {
    console.log('\n🔍 4. TEST AVEC SHARECODSERVICE');
    console.log('================================');
    
    // Vérifier si shareCodeService est disponible
    if (typeof window.shareCodeService === 'undefined') {
      console.log('⚠️ shareCodeService non accessible depuis la console');
      console.log('💡 Utiliser diagFrontend.testImportWithCode() à la place');
      return;
    }
    
    try {
      const result = await window.shareCodeService.importCollectionByCode(shareCode);
      console.log('✅ Import via service réussi:', result);
    } catch (error) {
      console.log('❌ Erreur via service:', error.message);
    }
  },
  
  // 5. Diagnostic complet
  async runFullDiagnostic(shareCode = 'I44WPL') {
    console.log('🚀 DIAGNOSTIC COMPLET FRONTEND');
    console.log('===============================\n');
    
    this.checkAuthState();
    await this.testApiDirect();
    await this.testImportWithCode(shareCode);
    
    console.log('\n📋 RECOMMANDATIONS:');
    console.log('1. Si profile fonctionne + import échoue → Problème spécifique route import');
    console.log('2. Si erreur 401 → Vérifier headers Authorization');
    console.log('3. Si erreur CORS → Vérifier configuration CORS backend');
    console.log('4. Si fetch échoue → Vérifier URL API');
  }
};

console.log('🔧 Diagnostic frontend chargé !');
console.log('📖 UTILISATION:');
console.log('   diagFrontend.runFullDiagnostic()           - Diagnostic complet');
console.log('   diagFrontend.checkAuthState()              - État auth');
console.log('   diagFrontend.testImportWithCode("CODE")    - Test import avec code');
console.log('   diagFrontend.testApiDirect()               - Test API direct');
console.log('');
