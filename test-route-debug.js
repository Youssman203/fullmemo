const http = require('http');

async function testRoutes() {
  console.log('🔍 Test de debug des routes');
  console.log('=' .repeat(40));

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

  try {
    // 1. Connexion
    console.log('\n1. Connexion...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    console.log('Statut connexion:', loginResponse.status);
    if (loginResponse.status !== 200) {
      console.log('❌ Connexion échouée');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Token obtenu');

    // 2. Test route collections existante (doit fonctionner)
    console.log('\n2. Test route GET collections (existante)...');
    const getResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Statut GET collections:', getResponse.status);
    if (getResponse.status === 200) {
      console.log('✅ Route GET fonctionne');
    } else {
      console.log('❌ Route GET ne fonctionne pas');
      console.log('Réponse:', getResponse.data);
    }

    // 3. Test route import (nouvelle)
    console.log('\n3. Test route POST import (nouvelle)...');
    const importResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections/import`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      collectionId: '688843d636d036b0383092d0'
    });

    console.log('Statut POST import:', importResponse.status);
    console.log('Réponse import:', importResponse.data);

    // 4. Test avec différents chemins pour debug
    console.log('\n4. Tests de debug des chemins...');
    
    const testPaths = [
      `/api/classes/${BAC2_CLASS_ID}/collections/import`,
      `/api/classes/${BAC2_CLASS_ID}/collections`,
      `/api/classes/${BAC2_CLASS_ID}`,
      '/api/classes'
    ];

    for (const path of testPaths) {
      console.log(`\n   Test: ${path}`);
      try {
        const testResponse = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: path,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`   Statut: ${testResponse.status}`);
      } catch (error) {
        console.log(`   Erreur: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testRoutes();
