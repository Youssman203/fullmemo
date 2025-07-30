// Test qui simule exactement ce que fait ClassCollectionsView
// Pour identifier la cause exacte de l'erreur

const http = require('http');

const STUDENT_EMAIL = 'etudiant.test@example.com';
const STUDENT_PASSWORD = 'password123';
const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function simulateClassCollectionsView() {
  console.log('🎭 Simulation exacte de ClassCollectionsView');
  console.log('=' .repeat(60));

  try {
    // 1. Connexion étudiant (comme le ferait l'app)
    console.log('\n1. 🔑 Connexion étudiant');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResponse = await makeRequest(loginOptions, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Connexion échouée');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');

    // 2. Simulation de la fonction fetchClassCollections
    console.log('\n2. 🎯 Simulation fetchClassCollections()');
    console.log('   - setLoading(true) → simulé');
    console.log('   - setError(\'\') → simulé');
    console.log('   - Appel getClassCollections(classId)...');

    // 3. Simulation de classService.getClassCollections()
    console.log('\n3. 📞 Simulation classService.getClassCollections()');
    console.log('   - Appel api.get(`/classes/${classId}/collections`)...');

    // 4. Simulation de api.get() - c'est ici que ça peut échouer
    console.log('\n4. 🌐 Simulation api.get()');
    
    const apiUrl = 'http://localhost:5000/api';
    const endpoint = `/classes/${BAC2_CLASS_ID}/collections`;
    const fullUrl = `${apiUrl}${endpoint}`;
    
    console.log('   - URL:', fullUrl);
    console.log('   - Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    });

    // Faire la vraie requête comme le ferait le frontend
    const collectionsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${endpoint}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const collectionsResponse = await makeRequest(collectionsOptions);
    console.log('   - Statut:', collectionsResponse.status);

    if (collectionsResponse.status !== 200) {
      console.log('❌ Erreur API - C\'est ici que ça échoue !');
      console.log('   - Message:', collectionsResponse.data.message || collectionsResponse.data);
      
      // Simuler ce que fait le composant
      console.log('\n5. 🎭 Simulation gestion d\'erreur dans ClassCollectionsView');
      console.log('   - catch (error) déclenché');
      console.log('   - setError() appelé avec:', collectionsResponse.data.message || 'Erreur lors de la récupération des collections de la classe');
      console.log('   - setLoading(false)');
      
      return;
    }

    // 5. Simulation du parsing des données (partie critique)
    console.log('\n5. 📊 Simulation parsing des données');
    
    const apiResponse = collectionsResponse.data;
    console.log('   - Réponse API brute:', JSON.stringify(apiResponse, null, 2));
    
    // Vérifier la structure exacte attendue par le composant
    console.log('\n6. 🔍 Vérification structure pour ClassCollectionsView');
    
    try {
      // Simulation de: const response = await getClassCollections(classId);
      const response = apiResponse;
      console.log('   - response:', Object.keys(response));
      
      // Simulation de: setClassInfo(response.data.class);
      const classInfo = response.data?.class;
      console.log('   - response.data:', response.data ? Object.keys(response.data) : 'undefined');
      console.log('   - response.data.class:', classInfo ? classInfo.name : 'undefined');
      
      // Simulation de: setCollections(response.data.collections || []);
      const collections = response.data?.collections || [];
      console.log('   - response.data.collections:', Array.isArray(collections) ? `Array[${collections.length}]` : 'undefined');
      
      if (classInfo && Array.isArray(collections)) {
        console.log('✅ Parsing réussi !');
        console.log('   - Classe:', classInfo.name);
        console.log('   - Collections:', collections.length);
        collections.forEach((coll, idx) => {
          console.log(`     ${idx + 1}. ${coll.name}`);
        });
        
        console.log('\n🎉 ClassCollectionsView devrait fonctionner normalement !');
        console.log('Si vous voyez toujours l\'erreur, c\'est un problème de timing ou d\'état React.');
        
      } else {
        console.log('❌ Parsing échoué !');
        console.log('   - classInfo valide:', !!classInfo);
        console.log('   - collections valide:', Array.isArray(collections));
        
        // C'est probablement ici le problème
        console.log('\n🚨 PROBLÈME IDENTIFIÉ :');
        console.log('La structure de réponse ne correspond pas à ce qu\'attend le composant !');
      }
      
    } catch (parseError) {
      console.log('❌ Erreur lors du parsing des données');
      console.log('   - Erreur:', parseError.message);
      console.log('\n🚨 C\'est ici que ClassCollectionsView échoue !');
      console.log('L\'erreur sera catchée et affichera: "Erreur lors de la récupération des collections de la classe"');
    }

    // 7. Test avec différents scénarios
    console.log('\n7. 🧪 Tests de scénarios problématiques');
    
    // Test avec classId invalide
    console.log('   Test avec classId invalide...');
    const badClassOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/invalid-id/collections',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const badClassResponse = await makeRequest(badClassOptions);
    console.log('   - Statut classId invalide:', badClassResponse.status);
    if (badClassResponse.status !== 200) {
      console.log('   - Message erreur:', badClassResponse.data.message);
      console.log('   ✅ Gestion d\'erreur normale pour classId invalide');
    }

    // Test avec token invalide
    console.log('   Test avec token invalide...');
    const badTokenOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    };

    const badTokenResponse = await makeRequest(badTokenOptions);
    console.log('   - Statut token invalide:', badTokenResponse.status);
    console.log('   ✅ Gestion d\'erreur normale pour token invalide');

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error.message);
  }
}

// Fonction pour tester un cas spécifique d'erreur
async function testSpecificErrorCase() {
  console.log('\n🔬 Test de cas d\'erreur spécifique');
  console.log('-'.repeat(40));
  
  // Simuler une réponse malformée ou vide
  const malformedResponses = [
    null,
    undefined,
    {},
    { success: false },
    { data: null },
    { data: {} },
    { data: { class: null, collections: null } }
  ];

  for (let i = 0; i < malformedResponses.length; i++) {
    const testResponse = malformedResponses[i];
    console.log(`\nTest ${i + 1}: ${JSON.stringify(testResponse)}`);
    
    try {
      const classInfo = testResponse?.data?.class;
      const collections = testResponse?.data?.collections || [];
      
      console.log('   - classInfo:', classInfo ? 'OK' : 'FAIL');
      console.log('   - collections:', Array.isArray(collections) ? 'OK' : 'FAIL');
      
      if (!classInfo || !Array.isArray(collections)) {
        console.log('   ❌ Ce type de réponse causerait une erreur');
      }
    } catch (error) {
      console.log('   ❌ Erreur de parsing:', error.message);
    }
  }
}

console.log('🚀 Démarrage de la simulation...');
simulateClassCollectionsView().then(() => {
  return testSpecificErrorCase();
}).then(() => {
  console.log('\n✅ Simulation terminée');
});
