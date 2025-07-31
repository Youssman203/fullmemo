// Test rapide API Simple Bulk Import
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:5000';

// Token d'authentification (à obtenir via login)
let AUTH_TOKEN = null;

// 1. Login pour obtenir le token
const login = async () => {
  console.log('🔐 Test de connexion...');
  
  try {
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'prof.martin@example.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      AUTH_TOKEN = data.token;
      console.log('✅ Connexion réussie:', data.user.email, '- Role:', data.user.role);
      return true;
    } else {
      console.error('❌ Échec connexion:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
    return false;
  }
};

// 2. Test de la route simple-bulk-import/preview
const testPreviewRoute = async () => {
  console.log('\n🧪 Test route /api/simple-bulk-import/preview...');
  
  if (!fs.existsSync('./test-cartes-simple-exemple.csv')) {
    console.error('❌ Fichier test-cartes-simple-exemple.csv non trouvé');
    return false;
  }
  
  try {
    const formData = new FormData();
    formData.append('bulkFile', fs.createReadStream('./test-cartes-simple-exemple.csv'));
    
    const response = await fetch(`${API_BASE}/api/simple-bulk-import/preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Preview réussie:');
      console.log('   📊 Total lignes:', data.data.totalRows);
      console.log('   ✅ Cartes valides:', data.data.validCards);  
      console.log('   ❌ Cartes invalides:', data.data.invalidCards);
      console.log('   👀 Aperçu:', data.data.previewData.length, 'cartes');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Échec preview:', response.status, error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur preview:', error.message);
    return false;
  }
};

// 3. Test complet
const runTests = async () => {
  console.log('🚀 DÉBUT DES TESTS API SIMPLE BULK IMPORT\n');
  
  // Test de connexion
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ TESTS ÉCHOUÉS - Connexion impossible');
    return;
  }
  
  // Test preview
  const previewSuccess = await testPreviewRoute();
  
  console.log('\n📊 RÉSUMÉ DES TESTS:');
  console.log('   🔐 Login:', loginSuccess ? '✅' : '❌');
  console.log('   🧪 Preview:', previewSuccess ? '✅' : '❌');
  
  if (loginSuccess && previewSuccess) {
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('💡 La fonctionnalité Import Simple CSV est opérationnelle');
    console.log('📋 Vous pouvez maintenant tester dans le navigateur:');
    console.log('   1. Aller sur http://localhost:3000');
    console.log('   2. Se connecter avec prof.martin@example.com');
    console.log('   3. Aller dans Collections');
    console.log('   4. Cliquer "Import Simple CSV"');
    console.log('   5. Utiliser le fichier test-cartes-simple-exemple.csv');
  } else {
    console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Vérifiez que le serveur backend est démarré sur le port 5000');
  }
};

// Exécuter les tests
runTests().catch(console.error);
