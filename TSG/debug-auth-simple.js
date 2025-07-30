/**
 * 🔍 DIAGNOSTIC SIMPLE PROBLÈME TOKEN NON AUTORISÉ
 */

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
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function main() {
  console.log('🔍 DIAGNOSTIC PROBLÈME TOKEN NON AUTORISÉ');
  console.log('==========================================\n');

  try {
    // 1. Vérifier serveur backend
    console.log('1️⃣ Test serveur backend...');
    try {
      const ping = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('   ✅ Backend accessible, status:', ping.status);
    } catch (error) {
      console.log('   ❌ Backend inaccessible:', error.message);
      console.log('   💡 Démarrer avec: cd c:/memoire/backend && node server.js');
      return;
    }

    // 2. Test login
    console.log('\n2️⃣ Test authentification...');
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
      console.log('   ❌ Login échoué:', login.status, login.data);
      console.log('   💡 Vérifier utilisateurs dans la DB');
      return;
    }

    const token = login.data.token;
    console.log('   ✅ Login réussi');
    console.log('   🔑 Token:', token.substring(0, 50) + '...');

    // 3. Vérifier token valide
    console.log('\n3️⃣ Validation token...');
    const profile = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (profile.status !== 200) {
      console.log('   ❌ Token rejeté:', profile.status, profile.data);
      console.log('   💡 Problème middleware ou JWT_SECRET');
      return;
    }

    console.log('   ✅ Token valide, middleware fonctionne');

    // 4. Créer collection de test
    console.log('\n4️⃣ Création collection test...');
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
      name: 'Test Debug Collection',
      description: 'Collection pour test debug'
    });

    if (collection.status !== 201) {
      console.log('   ❌ Échec création collection:', collection.status);
      return;
    }

    const collectionId = collection.data.collection._id;
    console.log('   ✅ Collection créée:', collectionId);

    // 5. Générer code de partage
    console.log('\n5️⃣ Génération code partage...');
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
      console.log('   ❌ Échec génération code:', shareCode.status, shareCode.data);
      console.log('   💡 Vérifier routes /api/share dans server.js');
      return;
    }

    const code = shareCode.data.data.code;
    console.log('   ✅ Code généré:', code);

    // 6. Créer utilisateur étudiant pour test import
    console.log('\n6️⃣ Création étudiant test...');
    const student = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Student Test',
      email: 'test.student@debug.com',
      password: 'password123',
      role: 'student'
    });

    let studentToken;
    if (student.status === 201) {
      studentToken = student.data.token;
      console.log('   ✅ Étudiant créé');
    } else {
      // Essayer de se connecter si existe déjà
      const studentLogin = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'test.student@debug.com',
        password: 'password123'
      });

      if (studentLogin.status === 200) {
        studentToken = studentLogin.data.token;
        console.log('   ✅ Connexion étudiant existant');
      } else {
        console.log('   ❌ Impossible créer/connecter étudiant');
        return;
      }
    }

    console.log('   🔑 Token étudiant:', studentToken.substring(0, 50) + '...');

    // 7. TEST CRITIQUE : Import collection
    console.log('\n7️⃣ 🚨 TEST IMPORT COLLECTION (CRITIQUE) 🚨');
    console.log('   Code à importer:', code);
    console.log('   Token utilisé:', studentToken.substring(0, 50) + '...');

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
    console.log('   Headers:', importResult.headers);

    if (importResult.status === 201) {
      console.log('   ✅ IMPORT RÉUSSI ! BACKEND FONCTIONNE CORRECTEMENT');
      console.log('   💡 LE PROBLÈME VIENT DU FRONTEND');
      console.log('   Vérifier:');
      console.log('   - Token dans localStorage frontend');
      console.log('   - Headers Authorization dans les requêtes');
      console.log('   - Gestion des erreurs frontend');
    } else if (importResult.status === 401) {
      console.log('   ❌ ERREUR 401 - TOKEN NON AUTORISÉ CONFIRMÉ');
      console.log('   Réponse:', importResult.data);
      
      // Analyser le token en détail
      try {
        const payload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64').toString());
        console.log('\n   🔍 ANALYSE TOKEN:');
        console.log('      User ID:', payload.id);
        console.log('      Émis le:', new Date(payload.iat * 1000));
        console.log('      Expire le:', new Date(payload.exp * 1000));
        console.log('      Maintenant:', new Date());
        console.log('      Expiré:', payload.exp < Math.floor(Date.now() / 1000));
        
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          console.log('   🚨 CAUSE: TOKEN EXPIRÉ');
        } else {
          console.log('   🚨 CAUSE: TOKEN REJETÉ PAR LE SERVEUR');
          console.log('   💡 Vérifier JWT_SECRET et middleware');
        }
      } catch (e) {
        console.log('   🚨 CAUSE: TOKEN MALFORMÉ');
      }
    } else {
      console.log('   ❌ ERREUR INATTENDUE:', importResult.status);
      console.log('   Réponse:', importResult.data);
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
  }
}

// Lancer le diagnostic
main().catch(console.error);
