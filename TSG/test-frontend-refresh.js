// Script à exécuter dans la console du navigateur pour tester le rafraîchissement
// 1. Aller sur http://localhost:3000 
// 2. Se connecter comme étudiant (etudiant.test@example.com / password123)
// 3. Aller sur la page Collections
// 4. Ouvrir F12 > Console
// 5. Coller ce script

function testFrontendRefresh() {
  console.log('🧪 Test rafraîchissement frontend après import\n');
  
  // Test 1: Vérifier état initial
  console.log('1. État initial des collections:');
  if (window.collections && window.collections.length) {
    console.log(`📚 ${window.collections.length} collections actuelles`);
    window.collections.forEach((col, i) => {
      console.log(`   ${i+1}. ${col.name} (${col._id})`);
    });
  } else {
    console.log('❓ Variable collections non accessible dans window');
  }
  
  // Test 2: Vérifier les fonctions DataContext
  console.log('\n2. Vérification DataContext:');
  if (window.getUserCollections) {
    console.log('✅ getUserCollections disponible');
  } else {
    console.log('❌ getUserCollections non disponible');
  }
  
  // Test 3: Simulation d'import
  console.log('\n3. Test simulation import...');
  const testCode = 'TLC37O'; // Code généré dans le test précédent
  
  if (window.fetch) {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔐 Token trouvé, test import...');
      
      fetch(`http://localhost:5000/api/share/code/${testCode}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('📊 Status import:', response.status);
        return response.json();
      })
      .then(data => {
        if (data.success) {
          console.log('✅ Import réussi:', data.data.collection.name);
          
          // Test 4: Rafraîchir les collections
          console.log('\n4. Test rafraîchissement manuel...');
          if (window.getUserCollections) {
            window.getUserCollections()
              .then(() => {
                console.log('✅ Rafraîchissement manuel réussi');
                console.log('💡 Vérifiez si la collection apparaît maintenant dans l\'interface');
              })
              .catch(err => {
                console.log('❌ Erreur rafraîchissement:', err.message);
              });
          }
        } else {
          console.log('❌ Erreur import:', data.message);
        }
      })
      .catch(err => {
        if (err.message.includes('400')) {
          console.log('⚠️ Collection déjà importée (normal si test répété)');
        } else {
          console.log('❌ Erreur requête:', err.message);
        }
      });
    } else {
      console.log('❌ Pas de token - connectez-vous d\'abord');
    }
  }
  
  console.log('\n💡 Instructions:');
  console.log('1. Si import réussi, vérifiez que la collection apparaît');
  console.log('2. Si pas visible, rechargez la page (F5)');
  console.log('3. Le problème était que le frontend ne rafraîchissait pas après import');
}

// Exposer les fonctions dans window pour debugging
if (typeof window !== 'undefined') {
  // Essayer d'accéder aux fonctions React via les dev tools
  const reactRoot = document.querySelector('#root')._reactInternalFiber || 
                    document.querySelector('#root')._reactInternalInstance;
  
  if (reactRoot) {
    console.log('🔍 Root React trouvé, recherche du contexte...');
  }
}

// Exécuter le test
testFrontendRefresh();
