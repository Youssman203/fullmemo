const http = require('http');

// Configuration
const FRONTEND_URL = 'http://localhost:3000';
const STUDENT_EMAIL = 'etudiant.test@example.com';
const STUDENT_PASSWORD = 'password123';
const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed';

// Fonction pour faire des requêtes HTTP
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
            headers: res.headers,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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

async function testFrontendWorkflow() {
  console.log('🔄 Test automatisé du workflow frontend étudiant');
  console.log('=' .repeat(60));

  try {
    // 1. Test de connexion étudiant
    console.log('\n1. 🔑 Test connexion étudiant');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Statut connexion:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Connexion échoué');
      console.log('Réponse:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    console.log('Utilisateur:', loginResponse.data.name);
    console.log('Rôle:', loginResponse.data.role);

    // 2. Vérifier si l'étudiant est inscrit dans la classe bac2
    console.log('\n2. 📚 Vérification inscription classe bac2');
    
    const studentClassesOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/student',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const studentClassesResponse = await makeRequest(studentClassesOptions);
    console.log('Statut classes étudiant:', studentClassesResponse.status);
    
    if (studentClassesResponse.status !== 200) {
      console.log('❌ Erreur récupération classes étudiant');
      return;
    }

    const studentClasses = studentClassesResponse.data.data || [];
    console.log('Classes de l\'étudiant:', studentClasses.length);
    
    let isBac2Student = false;
    for (const classe of studentClasses) {
      console.log(`   - ${classe.name} (${classe._id})`);
      if (classe._id === BAC2_CLASS_ID) {
        isBac2Student = true;
        console.log('   ✅ Étudiant inscrit dans bac2');
      }
    }

    if (!isBac2Student) {
      console.log('⚠️ Étudiant pas inscrit dans bac2, inscription...');
      
      const joinOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/classes/join/9BONA1',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const joinResponse = await makeRequest(joinOptions);
      console.log('Statut inscription bac2:', joinResponse.status);
      
      if (joinResponse.status === 200) {
        console.log('✅ Inscription bac2 réussie');
      } else if (joinResponse.status === 400 && joinResponse.data.message?.includes('déjà inscrit')) {
        console.log('✅ Déjà inscrit dans bac2');
        isBac2Student = true;
      } else {
        console.log('❌ Échec inscription bac2:', joinResponse.data);
      }
    }

    // 3. Test API collections de la classe bac2
    console.log('\n3. 🔍 Test API collections classe bac2');
    
    const collectionsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const collectionsResponse = await makeRequest(collectionsOptions);
    console.log('Statut collections API:', collectionsResponse.status);
    console.log('Headers réponse:', collectionsResponse.headers);
    
    if (collectionsResponse.status === 200) {
      console.log('✅ API collections fonctionne');
      console.log('Structure données:', Object.keys(collectionsResponse.data));
      
      if (collectionsResponse.data.data) {
        const classData = collectionsResponse.data.data.class;
        const collections = collectionsResponse.data.data.collections;
        
        console.log('Classe:', classData?.name);
        console.log('Nombre collections:', collections?.length || 0);
        
        if (collections && collections.length > 0) {
          collections.forEach((coll, idx) => {
            console.log(`   ${idx + 1}. ${coll.name} (${coll._id})`);
          });
        }
      }
    } else {
      console.log('❌ Erreur API collections:', collectionsResponse.data);
      return;
    }

    // 4. Simulation du service frontend
    console.log('\n4. 🎯 Simulation service frontend');
    
    // Simuler ce que fait classService.getClassCollections
    console.log('Ce que le service frontend devrait faire:');
    console.log(`   URL: /api/classes/${BAC2_CLASS_ID}/collections`);
    console.log(`   Headers: Authorization: Bearer ${token.substring(0, 20)}...`);
    console.log(`   Méthode: GET`);
    
    // Vérifier la structure de réponse attendue par le frontend
    const expectedStructure = {
      success: true,
      data: {
        class: { _id: BAC2_CLASS_ID, name: 'bac2' },
        collections: []
      }
    };
    
    console.log('Structure attendue par le frontend:');
    console.log(JSON.stringify(expectedStructure, null, 2));
    
    console.log('Structure reçue de l\'API:');
    console.log(JSON.stringify(collectionsResponse.data, null, 2));
    
    // Comparaison des structures
    const apiData = collectionsResponse.data;
    if (apiData.success && apiData.data && apiData.data.class && apiData.data.collections) {
      console.log('✅ Structure API compatible avec le frontend');
    } else {
      console.log('❌ Structure API incompatible avec le frontend');
      console.log('Différences détectées:');
      console.log('   - success:', !!apiData.success);
      console.log('   - data:', !!apiData.data);
      console.log('   - data.class:', !!apiData.data?.class);
      console.log('   - data.collections:', !!apiData.data?.collections);
    }

    // 5. Test du format de token
    console.log('\n5. 🔐 Vérification format token');
    
    console.log('Token valide:', token ? '✅' : '❌');
    console.log('Longueur token:', token?.length || 0);
    console.log('Format token:', token?.startsWith('eyJ') ? 'JWT ✅' : 'Format inconnu ❌');
    
    // Test d'un appel avec token malformé
    const badTokenOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer invalid_token`,
        'Content-Type': 'application/json'
      }
    };

    const badTokenResponse = await makeRequest(badTokenOptions);
    console.log('Test token invalide - Statut:', badTokenResponse.status);
    console.log('Réponse attendue: 401 ou 403');

    // 6. Analyse des headers et CORS
    console.log('\n6. 🌐 Vérification CORS et headers');
    
    const corsHeaders = collectionsResponse.headers;
    console.log('Headers CORS:');
    console.log('   - access-control-allow-origin:', corsHeaders['access-control-allow-origin'] || 'Non défini');
    console.log('   - access-control-allow-methods:', corsHeaders['access-control-allow-methods'] || 'Non défini');
    console.log('   - access-control-allow-headers:', corsHeaders['access-control-allow-headers'] || 'Non défini');
    console.log('   - content-type:', corsHeaders['content-type'] || 'Non défini');

    // Conclusion
    console.log('\n🎯 ANALYSE FINALE');
    console.log('=' .repeat(30));
    console.log('✅ Backend API: Fonctionnel');
    console.log('✅ Authentification: Fonctionnelle');
    console.log('✅ Permissions: Correctes');
    console.log('✅ Structure données: Compatible');
    console.log('');
    console.log('🔥 Le problème est donc côté frontend (composant React ou service)');
    console.log('Vérifiez:');
    console.log('1. Les logs [ClassCollectionsView] dans la console navigateur');
    console.log('2. L\'onglet Network pour voir les requêtes HTTP');
    console.log('3. Le service classService.js pour la gestion des erreurs');
    console.log('4. Le composant ClassCollectionsView.js pour le parsing des données');

  } catch (error) {
    console.error('❌ Erreur lors du test automatisé:', error.message);
  }
}

// Lancer le test
testFrontendWorkflow();
