const http = require('http');
const https = require('https');

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

// Script de test pour déboguer les classes d'étudiants
async function testStudentClasses() {
  try {
    console.log('🧪 Test de l\'API /api/classes/student');
    
    // 1. D'abord se connecter avec un compte étudiant
    console.log('\n1. Connexion avec un compte étudiant...');
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
      email: 'etudiant.test@example.com',
      password: 'password123'
    });
    
    console.log('📊 Réponse complète de login:', JSON.stringify(loginResponse, null, 2));
    
    if (loginResponse.status !== 200) {
      console.error('❌ Erreur de connexion:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie pour:', loginResponse.data.email);
    console.log('   Rôle:', loginResponse.data.role);
    console.log('   Token reçu:', token ? 'Oui' : 'Non');
    
    // 2. Récupérer les classes de l'étudiant
    console.log('\n2. Récupération des classes de l\'étudiant...');
    const classesOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/student',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const classesResponse = await makeRequest(classesOptions);
    
    if (classesResponse.status !== 200) {
      console.error('❌ Erreur lors de la récupération des classes:');
      console.error('   Status:', classesResponse.status);
      console.error('   Message:', classesResponse.data?.message || classesResponse.data);
      return;
    }
    
    console.log('✅ Réponse de l\'API reçue');
    console.log('   Nombre de classes:', classesResponse.data.count);
    console.log('   Success:', classesResponse.data.success);
    
    if (classesResponse.data.data && classesResponse.data.data.length > 0) {
      console.log('\n📚 Classes trouvées:');
      classesResponse.data.data.forEach((classe, index) => {
        console.log(`\n   Classe ${index + 1}:`);
        console.log(`   - ID: ${classe._id}`);
        console.log(`   - Nom: ${classe.name}`);
        console.log(`   - Description: ${classe.description || 'Aucune'}`);
        console.log(`   - Code d'invitation: ${classe.inviteCode}`);
        console.log(`   - Enseignant: ${classe.teacher?.name || 'Non défini'} (${classe.teacher?.email || 'N/A'})`);
        console.log(`   - Statistiques:`);
        console.log(`     * Étudiants: ${classe.stats?.totalStudents || 0}`);
        console.log(`     * Collections: ${classe.stats?.totalCollections || 0}`);
        console.log(`     * Cartes: ${classe.stats?.totalCards || 0}`);
        console.log(`   - Camarades: ${classe.classmates?.length || 0}`);
        if (classe.classmates && classe.classmates.length > 0) {
          classe.classmates.forEach(camarade => {
            console.log(`     * ${camarade.name} (${camarade.email})`);
          });
        }
      });
    } else {
      console.log('❌ Aucune classe trouvée pour cet étudiant');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:');
    console.error('   Erreur:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Lancer le test
testStudentClasses();
