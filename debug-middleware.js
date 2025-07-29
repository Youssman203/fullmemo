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
    console.log('🔍 Debug des routes et middlewares');
    
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
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

debugRoutes();
