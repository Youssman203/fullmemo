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

// Créer un compte étudiant de test
async function createTestStudent() {
  try {
    console.log('🧪 Création d\'un compte étudiant de test');
    
    const registerOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const userData = {
      name: 'Étudiant Test',
      email: 'etudiant.test@example.com',
      password: 'password123',
      role: 'student'
    };
    
    const response = await makeRequest(registerOptions, userData);
    
    if (response.status === 201) {
      console.log('✅ Compte étudiant créé avec succès');
      console.log('   Email:', userData.email);
      console.log('   Mot de passe:', userData.password);
      console.log('   Rôle:', userData.role);
    } else {
      console.log('ℹ️ Réponse du serveur:');
      console.log('   Status:', response.status);
      console.log('   Message:', response.data?.message || response.data);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createTestStudent();
