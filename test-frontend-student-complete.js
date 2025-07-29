// Script complet pour tester le problème côté étudiant dans le navigateur
// À exécuter dans la console du navigateur (F12 > Console)

console.log('🧪 Test complet - Connexion étudiant et récupération collections');
console.log('=' .repeat(70));

// Configuration
const STUDENT_EMAIL = 'etudiant.test@example.com';
const STUDENT_PASSWORD = 'password123';
const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed'; // ID de la classe bac2

// Fonction pour attendre
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour simuler la connexion
async function loginAsStudent() {
  console.log('\n1. 🔑 Connexion étudiant');
  
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: STUDENT_EMAIL,
        password: STUDENT_PASSWORD
      })
    });

    console.log('Statut connexion:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erreur connexion:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Connexion réussie');
    console.log('Nom:', data.name);
    console.log('Rôle:', data.role);
    console.log('Token:', data.token.substring(0, 20) + '...');

    // Sauvegarder le token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role
    }));

    return data;
  } catch (error) {
    console.log('❌ Erreur connexion:', error);
    return null;
  }
}

// Fonction pour tester l'API directement
async function testAPIDirectly() {
  console.log('\n2. 🔍 Test API direct');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Pas de token');
    return;
  }

  try {
    console.log('Test avec classe bac2 ID:', BAC2_CLASS_ID);
    
    const response = await fetch(`/api/classes/${BAC2_CLASS_ID}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Statut API:', response.status);
    console.log('Headers réponse:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erreur API:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Données API récupérées:');
    console.log('Structure:', Object.keys(data));
    
    if (data.data) {
      console.log('Classe:', data.data.class?.name);
      console.log('Collections:', data.data.collections?.length || 0);
      
      if (data.data.collections?.length > 0) {
        data.data.collections.forEach((coll, idx) => {
          console.log(`  ${idx + 1}. ${coll.name} (${coll._id})`);
        });
      }
    }

    return data;
  } catch (error) {
    console.log('❌ Erreur API:', error);
  }
}

// Fonction pour tester via le service React (si disponible)
async function testViaReactService() {
  console.log('\n3. 🎯 Test via service React');
  
  // Tenter d'accéder aux fonctions globales si disponibles
  if (window.getClassCollections) {
    console.log('✅ Fonction getClassCollections trouvée');
    try {
      const result = await window.getClassCollections(BAC2_CLASS_ID);
      console.log('Résultat service React:', result);
    } catch (error) {
      console.log('❌ Erreur service React:', error);
    }
  } else {
    console.log('⚠️ Fonction getClassCollections non disponible');
    console.log('Fonctions window disponibles:', Object.keys(window).filter(k => k.includes('get')));
  }
}

// Fonction pour simuler la navigation vers la page collections
function simulateNavigation() {
  console.log('\n4. 🧭 Simulation navigation');
  
  const currentPath = window.location.pathname;
  console.log('Page actuelle:', currentPath);
  
  const targetUrl = `/classes/${BAC2_CLASS_ID}/collections`;
  console.log('URL cible:', targetUrl);
  
  // Si on n'est pas sur la bonne page
  if (currentPath !== targetUrl) {
    console.log('📍 Navigation nécessaire vers:', targetUrl);
    console.log('Utilisez: window.location.href = "' + targetUrl + '"');
  } else {
    console.log('✅ Déjà sur la bonne page');
  }
}

// Fonction pour vérifier les logs du composant ClassCollectionsView
function checkComponentLogs() {
  console.log('\n5. 📊 Surveillance des logs composant');
  console.log('Regardez ci-dessus pour les logs [ClassCollectionsView]');
  console.log('Si pas de logs, le composant ne s\'est pas exécuté');
  
  // Vérifier si le composant est monté
  const classCollectionElements = document.querySelectorAll('[class*="ClassCollections"], [class*="class-collections"]');
  console.log('Éléments trouvés liés aux collections:', classCollectionElements.length);
  
  // Vérifier les erreurs dans la console
  console.log('\n📝 Vérifiez également:');
  console.log('- Onglet Network pour les requêtes HTTP');
  console.log('- React DevTools pour l\'état du composant');
  console.log('- Erreurs JavaScript dans cette console');
}

// Fonction principale
async function runCompleteTest() {
  console.log('🚀 Démarrage du test complet...\n');
  
  try {
    // 1. Connexion
    const user = await loginAsStudent();
    if (!user) return;
    
    await wait(1000);
    
    // 2. Test API direct
    const apiData = await testAPIDirectly();
    if (!apiData) return;
    
    await wait(1000);
    
    // 3. Test service React
    await testViaReactService();
    
    // 4. Navigation
    simulateNavigation();
    
    // 5. Vérification logs
    checkComponentLogs();
    
    console.log('\n🎉 Test terminé !');
    console.log('Si l\'API fonctionne mais pas le frontend, le problème est dans le composant React');
    
  } catch (error) {
    console.log('❌ Erreur test complet:', error);
  }
}

// Fonctions utilitaires exposées
window.testStudentLogin = loginAsStudent;
window.testAPIDirectly = testAPIDirectly;
window.testViaReactService = testViaReactService;
window.runCompleteTest = runCompleteTest;

// Message d'instructions
console.log('\n💡 Fonctions disponibles:');
console.log('- runCompleteTest() : Exécuter le test complet');
console.log('- testStudentLogin() : Connexion seule');
console.log('- testAPIDirectly() : Test API seul');
console.log('- testViaReactService() : Test service React');

console.log('\n🎬 Pour commencer, tapez: runCompleteTest()');

// Auto-démarrage si souhaité (décommentez la ligne suivante)
// runCompleteTest();
