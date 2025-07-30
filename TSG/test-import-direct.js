/**
 * 🎯 TEST DIRECT IMPORT COLLECTION - IDENTIFIER LE PROBLÈME EXACT
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testImport() {
  console.log('🚨 TEST DIRECT IMPORT COLLECTION');
  console.log('=================================\n');

  try {
    // 1. Login pour obtenir un token
    console.log('1. Login enseignant...');
    const login = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'prof.martin@example.com',
      password: 'password123'
    });

    if (login.status !== 200) {
      console.log('❌ Échec login:', login.status);
      return;
    }

    const token = login.data.token;
    console.log('✅ Token obtenu');

    // 2. Créer collection
    console.log('\n2. Création collection...');
    const collection = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/collections',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Collection Test Import',
      description: 'Test debug'
    });

    if (collection.status !== 201) {
      console.log('❌ Échec création:', collection.status, collection.data);
      return;
    }

    console.log('📊 Réponse collection:', collection.data);
    const collectionId = collection.data._id || collection.data.collection?._id;
    console.log('✅ Collection créée:', collectionId);

    // 3. Générer code de partage
    console.log('\n3. Génération code...');
    const shareCode = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/share/collections/${collectionId}/generate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (shareCode.status !== 201) {
      console.log('❌ Échec génération:', shareCode.status, shareCode.data);
      return;
    }

    const code = shareCode.data.data.code;
    console.log('✅ Code généré:', code);

    // 4. Créer étudiant
    console.log('\n4. Création étudiant...');
    const student = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Student Debug',
      email: 'debug.student@test.com',
      password: 'password123',
      role: 'student'
    });

    let studentToken;
    if (student.status === 201) {
      studentToken = student.data.token;
      console.log('✅ Étudiant créé');
    } else {
      // Login si existe
      const studentLogin = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'debug.student@test.com',
        password: 'password123'
      });

      if (studentLogin.status === 200) {
        studentToken = studentLogin.data.token;
        console.log('✅ Login étudiant');
      } else {
        console.log('❌ Impossible connecter étudiant');
        return;
      }
    }

    console.log('🔑 Token étudiant:', studentToken.substring(0, 30) + '...');

    // 5. 🎯 TEST CRITIQUE : Import
    console.log('\n5. 🚨 TEST IMPORT CRITIQUE 🚨');
    console.log('   Code:', code);
    console.log('   URL:', `/api/share/code/${code}/import`);
    console.log('   Token:', studentToken.substring(0, 30) + '...');

    const importResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/share/code/${code}/import`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    });

    console.log('\n🎯 RÉSULTAT FINAL:');
    console.log('   Status:', importResult.status);

    if (importResult.status === 201) {
      console.log('   ✅ IMPORT RÉUSSI !');
      console.log('   📊 CONCLUSION: LE BACKEND FONCTIONNE');
      console.log('   💡 LE PROBLÈME VIENT DU FRONTEND');
    } else if (importResult.status === 401) {
      console.log('   ❌ ERREUR 401 CONFIRMÉE');
      console.log('   Message:', importResult.data.message);
      console.log('   📊 CONCLUSION: PROBLÈME D\'AUTHENTIFICATION BACKEND');
      
      // Analyser le token
      try {
        const payload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64').toString());
        console.log('   \n🔍 ANALYSE TOKEN:');
        console.log('      ID utilisateur:', payload.id);
        console.log('      Émis le:', new Date(payload.iat * 1000));
        console.log('      Expire le:', new Date(payload.exp * 1000));
        console.log('      Expiré:', payload.exp < Math.floor(Date.now() / 1000));
      } catch (e) {
        console.log('   🔍 Token malformé:', e.message);
      }
    } else {
      console.log('   ❌ ERREUR AUTRE:', importResult.status);
      console.log('   Message:', importResult.data);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testImport().catch(console.error);
