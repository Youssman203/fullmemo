const http = require('http');

// Fonction pour faire des requêtes HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Tester les différentes routes pour identifier le problème
async function debugRoutes() {
  try {
    console.log('🔍 DEBUG COMPLET BACKEND - PROBLÈME TOKEN');
    console.log('================================================');
    
    // 1. Tester si le serveur répond
    console.log('\n1️⃣ TEST SERVEUR BACKEND');
    try {
      const healthCheck = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/health',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Serveur backend accessible:', healthCheck.status);
    } catch (error) {
      console.log('❌ Serveur backend inaccessible:', error.message);
      console.log('💡 Solution: Démarrer le serveur avec "node server.js"');
      return;
    }
    
    // 2. Tester l'authentification de base
    console.log('\n2️⃣ TEST AUTHENTIFICATION');
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'student@example.com',  // Utiliser un compte étudiant existant
      password: 'password123'
    });
    
    console.log('Login status:', loginResult.status);
    
    if (loginResult.status !== 200) {
      console.log('❌ Échec login, essayons avec prof.martin@example.com');
      const teacherLogin = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'prof.martin@example.com',
        password: 'password123'
      });
      
      if (teacherLogin.status === 200) {
        console.log('✅ Login enseignant réussi');
        var token = teacherLogin.data.token;
        var user = teacherLogin.data.user;
      } else {
        console.log('❌ Aucun login ne fonctionne');
        console.log('💡 Créer un utilisateur ou vérifier la DB');
        return;
      }
    } else {
      console.log('✅ Login étudiant réussi');
      var token = loginResult.data.token;
      var user = loginResult.data.user;
    }
    
    console.log('🔑 Token obtenu:', token.substring(0, 50) + '...');
    console.log('👤 Utilisateur:', user.name, '(' + user.role + ')');
    
    // 3. Vérifier la validité du token
    console.log('\n3️⃣ VALIDATION TOKEN');
    const profileTest = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile status:', profileTest.status);
    if (profileTest.status === 200) {
      console.log('✅ Token valide, middleware protect fonctionne');
    } else {
      console.log('❌ Token rejeté par middleware protect');
      console.log('Réponse:', profileTest.data);
      return;
    }
    
    // 4. Tester l'accès aux routes de partage
    console.log('\n4️⃣ TEST ROUTES PARTAGE');
    
    // Test de génération de code (nécessite une collection)
    console.log('\n4a. Test génération code de partage');
    
    // D'abord, créer une collection de test
    const testCollection = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/collections',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Collection Test Debug',
      description: 'Collection pour tester le partage'
    });
    
    if (testCollection.status === 201) {
      console.log('✅ Collection test créée:', testCollection.data.collection.name);
      const collectionId = testCollection.data.collection._id;
      
      // Tester génération code
      const generateCode = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/share/collections/${collectionId}/generate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Génération code status:', generateCode.status);
      if (generateCode.status === 201) {
        console.log('✅ Code généré:', generateCode.data.data.code);
        var shareCode = generateCode.data.data.code;
        
        // 5. Tester l'import avec ce code
        console.log('\n5️⃣ TEST IMPORT COLLECTION');
        
        // Créer un deuxième utilisateur pour tester l'import
        console.log('\n5a. Création utilisateur test pour import');
        const newUser = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, {
          name: 'Student Test Import',
          email: 'test.import@example.com',
          password: 'password123',
          role: 'student'
        });
        
        let importToken;
        if (newUser.status === 201) {
          console.log('✅ Utilisateur test créé');
          importToken = newUser.data.token;
        } else {
          console.log('⚠️ Utilisateur existe déjà, login...');
          const existingLogin = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }, {
            email: 'test.import@example.com',
            password: 'password123'
          });
          
          if (existingLogin.status === 200) {
            importToken = existingLogin.data.token;
          } else {
            console.log('❌ Impossible de créer/connecter utilisateur test');
            return;
          }
        }
        
        console.log('\n5b. Test import avec nouveau token');
        console.log('🔑 Token import:', importToken.substring(0, 50) + '...');
        
        const importTest = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: `/api/share/code/${shareCode}/import`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${importToken}`
          }
        });
        
        console.log('\n🎯 RÉSULTAT IMPORT:');
        console.log('Status:', importTest.status);
        console.log('Réponse:', importTest.data);
        
        if (importTest.status === 201) {
          console.log('✅ IMPORT RÉUSSI ! Le problème n\'est PAS côté backend.');
          console.log('💡 Le problème vient du frontend ou du token utilisé.');
        } else if (importTest.status === 401) {
          console.log('❌ ERREUR 401 CONFIRMÉE côté backend');
          console.log('🔍 Analysons le middleware d\'authentification...');
          
          // Analyser le token en détail
          try {
            const payload = JSON.parse(Buffer.from(importToken.split('.')[1], 'base64').toString());
            console.log('📊 Payload token import:');
            console.log('   User ID:', payload.id);
            console.log('   Émis le:', new Date(payload.iat * 1000));
            console.log('   Expire le:', new Date(payload.exp * 1000));
            console.log('   Maintenant:', new Date());
            console.log('   Expiré:', payload.exp < Math.floor(Date.now() / 1000));
          } catch (e) {
            console.log('❌ Token malformé:', e.message);
          }
        } else {
          console.log('❌ Erreur inattendue:', importTest.status);
        }
        
      } else {
        console.log('❌ Échec génération code:', generateCode.status, generateCode.data);
      }
      
    } else {
      console.log('❌ Impossible de créer collection test:', testCollection.status);
    }
    
    // 1. Login étudiant
    console.log('\n1. Connexion étudiant...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'etudiant.test@example.com',
      password: 'password123'
    });
    
    if (loginResponse.status !== 200) {
      console.error('❌ Échec de connexion');
      return;
    }
    
    const studentToken = loginResponse.data.token;
    console.log('✅ Étudiant connecté:', loginResponse.data.email);
    
    // 2. Tester route des classes enseignant (devrait échouer)
    console.log('\n2. Test route /api/classes (enseignants)...');
    const teacherClassesResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    
    console.log('   Status:', teacherClassesResponse.status);
    console.log('   Message:', teacherClassesResponse.data?.message || 'Pas de message');
    
    // 3. Tester route spécifique étudiant
    console.log('\n3. Test route /api/classes/student...');
    const studentClassesResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/student',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    
    console.log('   Status:', studentClassesResponse.status);
    console.log('   Message:', studentClassesResponse.data?.message || 'Pas de message');
    
    // 4. Créer un enseignant et tester
    console.log('\n4. Création d\'un compte enseignant...');
    const teacherResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Enseignant Test',
      email: 'prof.test@example.com',
      password: 'password123',
      role: 'teacher'
    });
    
    if (teacherResponse.status === 201) {
      console.log('✅ Enseignant créé:', teacherResponse.data.email);
      
      // 5. Login enseignant
      const teacherLoginResponse = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'prof.test@example.com',
        password: 'password123'
      });
      
      if (teacherLoginResponse.status === 200) {
        const teacherToken = teacherLoginResponse.data.token;
        console.log('✅ Enseignant connecté:', teacherLoginResponse.data.email);
        
        // 6. Tester route enseignant avec bon token
        console.log('\n6. Test route /api/classes avec token enseignant...');
        const teacherClassesTestResponse = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: '/api/classes',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${teacherToken}` }
        });
        
        console.log('   Status:', teacherClassesTestResponse.status);
        console.log('   Success:', teacherClassesTestResponse.data?.success);
        console.log('   Nombre de classes:', teacherClassesTestResponse.data?.count);
      }
    } else {
      console.log('ℹ️ Enseignant existe déjà ou erreur:', teacherResponse.data?.message);
    }
    
    // Tester la route des classes enseignant avec un token invalide
    console.log('\n7. Test route /api/classes avec token invalide...');
    const invalidToken = 'invalid-token';
    const invalidTeacherClassesResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${invalidToken}` }
    });
    
    console.log('   Status:', invalidTeacherClassesResponse.status);
    console.log('   Message:', invalidTeacherClassesResponse.data?.message || 'Pas de message');
    
    // Tester la route des classes enseignant sans token
    console.log('\n8. Test route /api/classes sans token...');
    const noTokenTeacherClassesResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes',
      method: 'GET'
    });
    
    console.log('   Status:', noTokenTeacherClassesResponse.status);
    console.log('   Message:', noTokenTeacherClassesResponse.data?.message || 'Pas de message');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

debugRoutes();
