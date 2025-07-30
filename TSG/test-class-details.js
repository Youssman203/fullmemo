// Test script pour vérifier l'API getClassById
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Helper function pour les requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    if (options.data) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(options.data));
    }
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(data)
          };
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    
    req.end();
  });
}

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEACHER_EMAIL = 'prof.martin@example.com';
const TEACHER_PASSWORD = 'password123';

async function testClassDetails() {
  console.log('🧪 Test de l\'API getClassById\n');
  
  try {
    // 1. Connexion enseignant
    console.log('1. Connexion enseignant...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      data: {
        email: TEACHER_EMAIL,
        password: TEACHER_PASSWORD
      }
    });
    
    console.log('Debug - Réponse de connexion:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.status !== 200) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie:', loginResponse.data.user?.name || 'Utilisateur');
    
    // 2. Récupération des classes
    console.log('\n2. Récupération des classes...');
    const classesResponse = await makeRequest(`${API_BASE_URL}/classes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const classes = classesResponse.data.data;
    console.log(`✅ ${classes.length} classes trouvées`);
    
    if (classes.length === 0) {
      console.log('❌ Aucune classe trouvée pour tester');
      return;
    }
    
    // 3. Test getClassById sur la première classe
    const testClassId = classes[0]._id;
    console.log(`\n3. Test getClassById pour la classe: ${classes[0].name}`);
    
    const classDetailsResponse = await makeRequest(`${API_BASE_URL}/classes/${testClassId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const classDetails = classDetailsResponse.data.data;
    console.log('✅ Détails de la classe récupérés:');
    console.log(`   - Nom: ${classDetails.name}`);
    console.log(`   - Description: ${classDetails.description || 'Aucune'}`);
    console.log(`   - Code d'invitation: ${classDetails.inviteCode}`);
    console.log(`   - Enseignant: ${classDetails.teacher.name} (${classDetails.teacher.email})`);
    console.log(`   - Étudiants: ${classDetails.students.length}`);
    console.log(`   - Collections: ${classDetails.collections.length}`);
    console.log(`   - Total cartes: ${classDetails.stats.totalCards}`);
    
    // 4. Test avec une classe inexistante
    console.log('\n4. Test avec une classe inexistante...');
    try {
      await makeRequest(`${API_BASE_URL}/classes/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log('✅ Gestion d\'erreur correcte pour classe inexistante');
    }
    
    console.log('\n🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
  }
}

testClassDetails();
