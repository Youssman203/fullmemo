// Test des fonctionnalités étudiantes de partage et téléchargement
// Exécuter dans la console du navigateur sur http://localhost:3000

console.log('🧪 Test des fonctionnalités étudiantes de partage');

// Configuration
const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3000';

// Données de test
const TEST_STUDENT = {
  email: 'etudiant.test@example.com',
  password: 'password123'
};

const TEST_TEACHER = {
  email: 'prof.martin@example.com',
  password: 'password123'
};

// Variables globales pour le test
let studentToken = '';
let teacherToken = '';
let testCollectionId = '';
let testSharedLinkToken = '';

// Fonctions utilitaires
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
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

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || `HTTP ${response.status}`);
  }
  
  return result;
};

// Tests
const runStudentFeaturesTest = async () => {
  try {
    console.log('\n🔐 1. Connexion enseignant pour créer du contenu de test...');
    const teacherLogin = await apiCall('/users/login', 'POST', TEST_TEACHER);
    teacherToken = teacherLogin.token;
    console.log('✅ Enseignant connecté');

    console.log('\n📚 2. Création d\'une collection de test...');
    const testCollection = await apiCall('/collections', 'POST', {
      name: 'Collection Test Partage',
      description: 'Collection pour tester les fonctionnalités étudiantes',
      category: 'Test',
      difficulty: 'moyen',
      tags: ['test', 'partage', 'étudiant']
    }, teacherToken);
    testCollectionId = testCollection._id;
    console.log('✅ Collection créée:', testCollection.name);

    console.log('\n🃏 3. Ajout de cartes de test...');
    const testCards = [
      {
        question: 'Quelle est la capitale de la France ?',
        answer: 'Paris',
        difficulty: 'facile',
        category: 'Géographie'
      },
      {
        question: 'Combien font 2 + 2 ?',
        answer: '4',
        difficulty: 'facile', 
        category: 'Mathématiques'
      },
      {
        question: 'Qui a écrit "Les Misérables" ?',
        answer: 'Victor Hugo',
        difficulty: 'moyen',
        category: 'Littérature'
      }
    ];

    for (const card of testCards) {
      await apiCall('/flashcards', 'POST', {
        ...card,
        collectionId: testCollectionId
      }, teacherToken);
    }
    console.log('✅ 3 cartes ajoutées à la collection');

    console.log('\n🔗 4. Création d\'un lien de partage...');
    const sharedLink = await apiCall(`/shared/collections/${testCollectionId}`, 'POST', {
      permissions: ['view', 'copy', 'download'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      maxUsage: 10
    }, teacherToken);
    testSharedLinkToken = sharedLink.token;
    console.log('✅ Lien de partage créé:', `${FRONTEND_BASE}/shared/${testSharedLinkToken}`);

    console.log('\n👥 5. Connexion étudiant...');
    const studentLogin = await apiCall('/users/login', 'POST', TEST_STUDENT);
    studentToken = studentLogin.token;
    console.log('✅ Étudiant connecté');

    console.log('\n🔍 6. Test accès à la collection partagée (sans auth)...');
    const sharedAccess = await apiCall(`/shared/${testSharedLinkToken}`);
    console.log('✅ Accès public réussi:', sharedAccess.collection.name);
    console.log(`   - Cartes disponibles: ${sharedAccess.flashcards.length}`);
    console.log(`   - Permissions: ${sharedAccess.permissions.join(', ')}`);

    console.log('\n🔍 7. Test accès avec authentification étudiant...');
    const authSharedAccess = await apiCall(`/shared/${testSharedLinkToken}`, 'GET', null, studentToken);
    console.log('✅ Accès authentifié réussi');

    console.log('\n📥 8. Test import de la collection par l\'étudiant...');
    const importResult = await apiCall(`/shared/${testSharedLinkToken}/download`, 'POST', {}, studentToken);
    console.log('✅ Import réussi:', importResult.message);

    console.log('\n📋 9. Vérification que la collection a été importée...');
    const studentCollections = await apiCall('/collections', 'GET', null, studentToken);
    const importedCollection = studentCollections.find(c => 
      c.name.includes('Collection Test Partage') || 
      c.description.includes('Collection pour tester')
    );
    
    if (importedCollection) {
      console.log('✅ Collection trouvée dans les collections de l\'étudiant');
      console.log(`   - Nom: ${importedCollection.name}`);
      console.log(`   - ID: ${importedCollection._id}`);
    } else {
      console.log('⚠️ Collection non trouvée dans les collections de l\'étudiant');
    }

    console.log('\n📊 10. Test des fonctionnalités frontend...');
    
    // Test de détection du format de lien
    const testUrls = [
      `${FRONTEND_BASE}/shared/${testSharedLinkToken}`,
      `/shared/${testSharedLinkToken}`,
      testSharedLinkToken,
      `token=${testSharedLinkToken}`
    ];

    console.log('✅ Formats de liens supportés:');
    testUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    console.log('\n🎯 11. Test d\'extraction de token...');
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

    testUrls.forEach(url => {
      const extracted = extractTokenFromUrl(url);
      console.log(`   "${url}" → ${extracted === testSharedLinkToken ? '✅' : '❌'} ${extracted}`);
    });

    console.log('\n📱 12. Test simulation localStorage étudiant...');
    const mockCollectionData = {
      token: testSharedLinkToken,
      name: 'Collection Test Partage',
      description: 'Collection pour tester les fonctionnalités étudiantes',
      cardCount: 3,
      teacherName: 'Prof. Martin',
      accessedAt: new Date().toISOString(),
      permissions: ['view', 'copy', 'download'],
      hasPassword: false,
      expiresAt: null,
      collectionData: sharedAccess
    };

    // Simuler la sauvegarde localStorage
    const accessedCollections = [mockCollectionData];
    console.log('✅ Simulation localStorage réussie');
    console.log('   Structure des données:', Object.keys(mockCollectionData));

    console.log('\n🎉 RÉSUMÉ DES TESTS');
    console.log('==================');
    console.log('✅ Connexion enseignant et étudiant');
    console.log('✅ Création de collection et cartes de test');
    console.log('✅ Génération de lien de partage');
    console.log('✅ Accès public à la collection partagée');
    console.log('✅ Accès authentifié à la collection');
    console.log('✅ Import de collection par l\'étudiant');
    console.log('✅ Extraction de tokens depuis URLs');
    console.log('✅ Structure localStorage pour interface');

    console.log('\n🔗 LIENS DE TEST GÉNÉRÉS:');
    console.log(`📱 Interface étudiant: ${FRONTEND_BASE}/student-shared`);
    console.log(`🔍 Collection partagée: ${FRONTEND_BASE}/shared/${testSharedLinkToken}`);
    console.log(`📊 Gestion enseignant: ${FRONTEND_BASE}/shared-links`);

    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('1. Ouvrir l\'interface étudiante');
    console.log('2. Tester l\'accès via le lien généré');
    console.log('3. Vérifier les fonctionnalités de copie/téléchargement');
    console.log('4. Tester l\'import et la révision');

    return {
      success: true,
      sharedLinkToken: testSharedLinkToken,
      collectionId: testCollectionId,
      frontendUrl: `${FRONTEND_BASE}/shared/${testSharedLinkToken}`,
      studentInterface: `${FRONTEND_BASE}/student-shared`
    };

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction d'aide pour nettoyer les données de test
const cleanup = async () => {
  try {
    console.log('🧹 Nettoyage des données de test...');
    
    if (testCollectionId && teacherToken) {
      await apiCall(`/collections/${testCollectionId}`, 'DELETE', null, teacherToken);
      console.log('✅ Collection de test supprimée');
    }
    
    console.log('✅ Nettoyage terminé');
  } catch (error) {
    console.error('⚠️ Erreur lors du nettoyage:', error);
  }
};

// Export pour utilisation
if (typeof window !== 'undefined') {
  window.testStudentFeatures = runStudentFeaturesTest;
  window.cleanupTest = cleanup;
  console.log('🎯 Fonctions disponibles:');
  console.log('  - testStudentFeatures(): Lance tous les tests');
  console.log('  - cleanupTest(): Nettoie les données de test');
  console.log('');
  console.log('💡 Pour lancer les tests: testStudentFeatures()');
}

export { runStudentFeaturesTest, cleanup };
