// Test à exécuter dans la console du navigateur pour valider l'intégration frontend
// Ouvrir http://localhost:3000 > F12 > Console > Coller ce code

async function testFrontendIntegration() {
  console.log('🧪 Test d\'intégration Frontend-Backend');
  console.log('📍 URL actuelle:', window.location.href);
  
  try {
    // Test 1: Vérifier que l'API backend est accessible
    console.log('\n1. Test connexion backend...');
    const backendTest = await fetch('http://localhost:5000/api/collections', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || 'test'}`
      }
    });
    
    console.log('✅ Backend accessible:', backendTest.status);
    
    // Test 2: Vérifier que les services sont chargés
    console.log('\n2. Vérification des services...');
    if (window.shareCodeService) {
      console.log('✅ shareCodeService disponible');
    } else {
      console.log('❌ shareCodeService manquant');
    }
    
    // Test 3: Vérifier le localStorage pour le token
    console.log('\n3. Vérification authentification...');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('✅ Utilisateur connecté');
      const userObj = JSON.parse(user);
      console.log(`👤 Utilisateur: ${userObj.name} (${userObj.role})`);
    } else {
      console.log('❌ Utilisateur non connecté');
      console.log('💡 Connectez-vous d\'abord pour tester les fonctionnalités');
    }
    
    // Test 4: Vérifier les modals dans le DOM
    console.log('\n4. Vérification des composants...');
    const shareModal = document.querySelector('[id*="share"]');
    const accessModal = document.querySelector('[id*="access"]');
    
    if (shareModal || accessModal) {
      console.log('✅ Modals présentes dans le DOM');
    } else {
      console.log('❓ Modals non encore montées (normal si pas sur page Collections)');
    }
    
    // Test 5: Test simple d'API (si connecté)
    if (token) {
      console.log('\n5. Test API de partage...');
      try {
        const testAPI = await fetch('http://localhost:5000/api/share/manage', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ API /api/share accessible:', testAPI.status);
      } catch (err) {
        console.log('❌ API /api/share inaccessible:', err.message);
      }
    }
    
    console.log('\n🎯 INSTRUCTIONS DE TEST:');
    console.log('1. Allez sur http://localhost:3000');
    console.log('2. Connectez-vous comme enseignant: prof.martin@example.com');
    console.log('3. Allez dans "Mes Collections"');
    console.log('4. Cliquez menu (⋮) > "Partager par code"');
    console.log('5. Testez la génération de code');
    
  } catch (error) {
    console.error('❌ Erreur de test:', error);
  }
}

// Exécuter le test
testFrontendIntegration();
