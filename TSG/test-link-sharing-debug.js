// Test de diagnostic complet du système de partage de liens
// Pour identifier pourquoi les liens ne passent pas entre enseignant et étudiant

const API_BASE = 'http://localhost:5000/api';

console.log('🔍 DIAGNOSTIC DU SYSTÈME DE PARTAGE DE LIENS');
console.log('=============================================');

// Variables de test
let teacherToken = '';
let teacherId = '';
let studentToken = '';
let testCollectionId = '';
let sharedLinkToken = '';

// Comptes de test
const TEACHER_ACCOUNT = {
  email: 'prof.martin@example.com',
  password: 'password123'
};

const STUDENT_ACCOUNT = {
  email: 'etudiant.test@example.com', 
  password: 'password123'
};

// Fonction utilitaire pour les appels API
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  console.log(`\n📡 API Call: ${method} ${endpoint}`);
  if (data) console.log('   Data:', JSON.stringify(data, null, 2));
  if (token) console.log('   Token:', token.substring(0, 20) + '...');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log('   Response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    throw error;
  }
};

// Test 1: Connexion enseignant
const testTeacherLogin = async () => {
  console.log('\n📝 ÉTAPE 1: Connexion enseignant');
  try {
    const response = await apiCall('/users/login', 'POST', TEACHER_ACCOUNT);
    teacherToken = response.token;
    teacherId = response._id; // L'ID est directement dans la réponse
    console.log('✅ Enseignant connecté avec succès');
    console.log(`   User ID: ${response._id}`);
    console.log(`   Role: ${response.role}`);
    console.log(`   Email: ${response.email}`);
    return true;
  } catch (error) {
    console.error('❌ Échec connexion enseignant:', error.message);
    return false;
  }
};

// Test 2: Récupération des collections enseignant
const testGetTeacherCollections = async () => {
  console.log('\n📚 ÉTAPE 2: Récupération collections enseignant');
  try {
    const collections = await apiCall('/collections', 'GET', null, teacherToken);
    console.log('✅ Collections récupérées');
    console.log(`   Nombre de collections: ${collections.data.length}`);
    
    if (collections.data && collections.data.length > 0) {
      // Prendre la première collection avec des cartes
      const collectionWithCards = collections.data.find(col => col.cardsCount > 0);
      const selectedCollection = collectionWithCards || collections.data[0];
      
      testCollectionId = selectedCollection._id;
      console.log(`   Collection sélectionnée: ${selectedCollection.name}`);
      console.log(`   Collection ID: ${testCollectionId}`);
      console.log(`   Nombre de cartes: ${selectedCollection.cardsCount}`);
      return true;
    } else {
      console.log('⚠️ Aucune collection trouvée - création nécessaire');
      return await createTestCollection();
    }
  } catch (error) {
    console.error('❌ Échec récupération collections:', error.message);
    return false;
  }
};

// Créer une collection de test si nécessaire
const createTestCollection = async () => {
  console.log('\n🔨 Création collection de test');
  try {
    const collection = await apiCall('/collections', 'POST', {
      name: 'Collection Test Partage',
      description: 'Collection pour tester le partage de liens',
      category: 'other',
      difficulty: 'medium',
      tags: ['test', 'partage']
    }, teacherToken);
    
    testCollectionId = collection._id;
    console.log('✅ Collection test créée');
    
    // Ajouter quelques cartes
    const testCards = [
      {
        question: 'Test question 1',
        answer: 'Test answer 1',
        difficulty: 'facile',
        category: 'Test',
        collectionId: testCollectionId
      },
      {
        question: 'Test question 2', 
        answer: 'Test answer 2',
        difficulty: 'moyen',
        category: 'Test',
        collectionId: testCollectionId
      }
    ];
    
    for (const card of testCards) {
      await apiCall('/flashcards', 'POST', card, teacherToken);
    }
    
    console.log('✅ Cartes de test ajoutées');
    return true;
  } catch (error) {
    console.error('❌ Échec création collection:', error.message);
    return false;
  }
};

// Test 3: Création du lien de partage
const testCreateSharedLink = async () => {
  console.log('\n🔗 ÉTAPE 3: Création lien de partage');
  try {
    const linkConfig = {
      permissions: ['view', 'copy', 'download'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      maxUsage: 50
    };
    
    console.log('   Configuration du lien:', linkConfig);
    
    const response = await apiCall(`/shared/collections/${testCollectionId}`, 'POST', linkConfig, teacherToken);
    sharedLinkToken = response.data.token;
    
    console.log('✅ Lien de partage créé');
    console.log(`   Token: ${sharedLinkToken}`);
    console.log(`   URL complète: ${response.data.shareUrl}`);
    console.log(`   Permissions: ${response.data.config.permissions.join(', ')}`);
    console.log(`   Expire le: ${response.data.config.expiresAt}`);
    console.log(`   Collection: ${response.data.collection.name}`);
    console.log(`   Créé par: ${response.data.createdBy.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ Échec création lien:', error.message);
    return false;
  }
};

// Test 4: Accès public au lien (sans authentification)
const testPublicAccess = async () => {
  console.log('\n🌐 ÉTAPE 4: Test accès public au lien');
  try {
    const response = await apiCall(`/shared/${sharedLinkToken}`);
    
    console.log('✅ Accès public réussi');
    console.log(`   Collection: ${response.collection.name}`);
    console.log(`   Cartes disponibles: ${response.flashcards.length}`);
    console.log(`   Permissions: ${response.permissions.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Échec accès public:', error.message);
    console.log('   Détails de l\'erreur:', error);
    return false;
  }
};

// Test 5: Connexion étudiant  
const testStudentLogin = async () => {
  console.log('\n👨‍🎓 ÉTAPE 5: Connexion étudiant');
  try {
    const response = await apiCall('/users/login', 'POST', STUDENT_ACCOUNT);
    studentToken = response.token;
    console.log('✅ Étudiant connecté');
    console.log(`   User ID: ${response.user._id}`);
    console.log(`   Role: ${response.user.role}`);
    console.log(`   Email: ${response.user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Échec connexion étudiant:', error.message);
    return false;
  }
};

// Test 6: Accès étudiant au lien partagé
const testStudentAccess = async () => {
  console.log('\n🎓 ÉTAPE 6: Accès étudiant au lien');
  try {
    const response = await apiCall(`/shared/${sharedLinkToken}`, 'GET', null, studentToken);
    
    console.log('✅ Accès étudiant réussi');
    console.log(`   Collection: ${response.collection.name}`);
    console.log(`   Cartes: ${response.flashcards.length}`);
    console.log(`   Permissions: ${response.permissions.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Échec accès étudiant:', error.message);
    return false;
  }
};

// Test 7: Import par l'étudiant
const testStudentImport = async () => {
  console.log('\n📥 ÉTAPE 7: Import par l\'étudiant');
  try {
    const response = await apiCall(`/shared/${sharedLinkToken}/download`, 'POST', {}, studentToken);
    
    console.log('✅ Import réussi');
    console.log(`   Message: ${response.message}`);
    
    return true;
  } catch (error) {
    console.error('❌ Échec import:', error.message);
    return false;
  }
};

// Test 8: Vérification des routes frontend
const testFrontendRoutes = async () => {
  console.log('\n🌐 ÉTAPE 8: Test routes frontend');
  
  const routes = [
    `/shared/${sharedLinkToken}`,
    '/student-shared',
    '/shared-links'
  ];
  
  routes.forEach(route => {
    const fullUrl = `http://localhost:3000${route}`;
    console.log(`   Route: ${fullUrl}`);
  });
  
  // Test si le serveur frontend répond
  try {
    const response = await fetch('http://localhost:3000');
    console.log(`✅ Frontend accessible (status: ${response.status})`);
    return true;
  } catch (error) {
    console.error('❌ Frontend non accessible:', error.message);
    return false;
  }
};

// Test 9: Vérification du service frontend
const testSharedLinkService = () => {
  console.log('\n🔧 ÉTAPE 9: Test service frontend');
  
  // Test de l'extraction de token (simulation)
  const extractTokenFromUrl = (url) => {
    const patterns = [
      /\/shared\/([a-f0-9]{24})/i,
      /token=([a-f0-9]{24})/i,
      /shared\/collection\/([a-f0-9]{24})/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    if (/^[a-f0-9]{24}$/i.test(url.trim())) {
      return url.trim();
    }
    
    return null;
  };
  
  const testUrls = [
    `http://localhost:3000/shared/${sharedLinkToken}`,
    `/shared/${sharedLinkToken}`,
    sharedLinkToken
  ];
  
  console.log('   Test extraction de tokens:');
  testUrls.forEach(url => {
    const extracted = extractTokenFromUrl(url);
    const isValid = extracted === sharedLinkToken;
    console.log(`     "${url}" → ${isValid ? '✅' : '❌'} ${extracted}`);
  });
  
  return true;
};

// Fonction principale de diagnostic
const runCompleteDiagnostic = async () => {
  console.log('🚀 DÉMARRAGE DU DIAGNOSTIC COMPLET');
  console.log('==================================\n');
  
  const results = {
    teacherLogin: false,
    getCollections: false,
    createLink: false,
    publicAccess: false,
    studentLogin: false,
    studentAccess: false,
    studentImport: false,
    frontendRoutes: false,
    serviceTest: false
  };
  
  try {
    // Tests séquentiels
    results.teacherLogin = await testTeacherLogin();
    if (!results.teacherLogin) throw new Error('Connexion enseignant échouée');
    
    results.getCollections = await testGetTeacherCollections();
    if (!results.getCollections) throw new Error('Récupération collections échouée');
    
    results.createLink = await testCreateSharedLink();
    if (!results.createLink) throw new Error('Création lien échouée');
    
    results.publicAccess = await testPublicAccess();
    
    results.studentLogin = await testStudentLogin();
    if (!results.studentLogin) throw new Error('Connexion étudiant échouée');
    
    results.studentAccess = await testStudentAccess();
    
    if (results.studentAccess) {
      results.studentImport = await testStudentImport();
    }
    
    results.frontendRoutes = await testFrontendRoutes();
    results.serviceTest = testSharedLinkService();
    
  } catch (error) {
    console.error('\n💥 ARRÊT DU DIAGNOSTIC:', error.message);
  }
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC');
  console.log('========================');
  
  Object.entries(results).forEach(([test, success]) => {
    console.log(`${success ? '✅' : '❌'} ${test}: ${success ? 'RÉUSSI' : 'ÉCHEC'}`);
  });
  
  // Analyse des problèmes
  console.log('\n🔍 ANALYSE DES PROBLÈMES:');
  
  if (!results.publicAccess) {
    console.log('❌ PROBLÈME: L\'accès public au lien ne fonctionne pas');
    console.log('   - Vérifier le backend et les routes /api/shared');
    console.log('   - Vérifier la configuration CORS');
    console.log('   - Vérifier le modèle SharedLink');
  }
  
  if (!results.studentAccess && results.publicAccess) {
    console.log('❌ PROBLÈME: L\'accès étudiant échoue mais l\'accès public fonctionne');
    console.log('   - Problème d\'authentification côté étudiant');
    console.log('   - Vérifier le middleware optionalProtect');
  }
  
  if (!results.frontendRoutes) {
    console.log('❌ PROBLÈME: Le frontend n\'est pas accessible');
    console.log('   - Vérifier que npm start fonctionne');
    console.log('   - Vérifier le port 3000');
  }
  
  // Liens de test générés
  if (sharedLinkToken) {
    console.log('\n🔗 LIENS DE TEST GÉNÉRÉS:');
    console.log(`   Frontend: http://localhost:3000/shared/${sharedLinkToken}`);
    console.log(`   API: http://localhost:5000/api/shared/${sharedLinkToken}`);
    console.log(`   Token: ${sharedLinkToken}`);
  }
  
  return {
    success: Object.values(results).every(r => r),
    results,
    sharedLinkToken,
    testUrls: {
      frontend: `http://localhost:3000/shared/${sharedLinkToken}`,
      api: `http://localhost:5000/api/shared/${sharedLinkToken}`,
      studentInterface: 'http://localhost:3000/student-shared'
    }
  };
};

// Auto-exécution
if (typeof window !== 'undefined') {
  window.runCompleteDiagnostic = runCompleteDiagnostic;
  console.log('🎯 Fonction disponible: runCompleteDiagnostic()');
  console.log('💡 Pour lancer le diagnostic: runCompleteDiagnostic()');
} else {
  // Pour Node.js
  runCompleteDiagnostic().then(result => {
    console.log('\n🏁 DIAGNOSTIC TERMINÉ');
    process.exit(result.success ? 0 : 1);
  });
}

export { runCompleteDiagnostic };
